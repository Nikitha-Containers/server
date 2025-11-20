import express from "express";
import axios from "axios";
import salesOrder from "../../models/SalesOrder/SO_Schema.js";

const router = express.Router();

const sapURL =
  "http://180.235.121.59:19930/GET_SAP_API/SalesOrderDetails?FromDate=20251003&ToDate=20251003";

const BATCH_SIZE = 100;

// Parse JSON with nested JSON content
function debugParseJSON(str, context = "") {
  if (!str || typeof str !== "string") return [];
  try {
    return JSON.parse(str);
  } catch (err1) {
    try {
      let cleaned = str.replace(/\\"/g, '"');
      cleaned = cleaned.replace(
        /"SalesExpenseLines":"\[([^\]]+)\]"/g,
        (match, innerJSON) => {
          const unescapedInner = innerJSON.replace(/\\"/g, '"');
          return `"SalesExpenseLines":[${unescapedInner}]`;
        }
      );
      return JSON.parse(cleaned);
    } catch (err2) {
      console.error(`${context}: Parse failed:`, err2.message);
      return [];
    }
  }
}

// Parse ItemDetail field with nested SalesExpenseLines
function parseItemDetailManually(itemDetailStr) {
  if (!itemDetailStr) return [];

  try {
    let fixed = itemDetailStr
      .replace(/\\"/g, '"')
      .replace(/"SalesExpenseLines":"\[/g, '"SalesExpenseLines":[')
      .replace(/\]"/g, "]");

    return JSON.parse(fixed);
  } catch (err) {
    console.error("ItemDetail parse failed:", err.message);
    try {
      const basicItem = {
        AccountCode: extractField(itemDetailStr, "AccountCode"),
        ItemCode: extractField(itemDetailStr, "ItemCode"),
        ItemDescription: extractField(itemDetailStr, "ItemDescription"),
        LocationCode: extractNumberField(itemDetailStr, "LocationCode"),
        Price: extractNumberField(itemDetailStr, "Price"),
        Quantity: extractNumberField(itemDetailStr, "Quantity"),
        TaxCode: extractField(itemDetailStr, "TaxCode"),
        WarehouseCode: extractField(itemDetailStr, "WarehouseCode"),
        SalesExpenseLines: [],
      };
      return [basicItem];
    } catch (fallbackErr) {
      console.error("Fallback extraction failed");
      return [];
    }
  }
}

// Extract string field from JSON string
function extractField(str, fieldName) {
  const regex = new RegExp(`"${fieldName}":"([^"]*)"`);
  const match = str.match(regex);
  return match ? match[1] : "";
}

// Extract number field from JSON string
function extractNumberField(str, fieldName) {
  const regex = new RegExp(`"${fieldName}":([0-9.-]+)`);
  const match = str.match(regex);
  return match ? Number(match[1]) : 0;
}

// Safe number conversion
function safeNumber(value) {
  if (value === null || value === undefined || value === "") return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
}

// Safe date conversion
function safeDate(dateStr) {
  if (!dateStr) return new Date();
  try {
    const cleanDateStr = dateStr.split(".")[0];
    return new Date(cleanDateStr);
  } catch (err) {
    console.error("Date conversion error:", err);
    return new Date();
  }
}

// Sync SAP sales orders to MongoDB
router.get("/sync", async (req, res) => {
  try {
    console.time("Total Sync Time");
    console.log("Starting SAP sync...");

    const response = await axios.get(sapURL);
    const raw = response.data?.Data?.[0]?.JSONRESULT;

    if (!raw) {
      return res.status(400).json({ message: "No SAP data found" });
    }

    const sapArray = debugParseJSON(raw, "Main JSONRESULT");
    if (!sapArray.length) {
      return res.status(500).json({ message: "Failed to parse SAP JSON" });
    }

    console.log(
      `Processing ${sapArray.length} records in batches of ${BATCH_SIZE}`
    );

    let successCount = 0;
    let errorCount = 0;
    let newRecordsCount = 0;
    let updatedRecordsCount = 0;

    // Process in batches
    for (let i = 0; i < sapArray.length; i += BATCH_SIZE) {
      const batch = sapArray.slice(i, i + BATCH_SIZE);
      const bulkOperations = [];

      const invoiceNumbers = batch
        .map((item) => item.BPL_IDAssignedToInvoice?.toString() || "")
        .filter((inv) => inv !== "");

      const existingRecords = await salesOrder
        .find({
          invoice_no: { $in: invoiceNumbers },
        })
        .select("invoice_no unique_id")
        .lean();

      const existingRecordsMap = new Map(
        existingRecords.map((doc) => [doc.invoice_no, doc.unique_id])
      );

      const lastDoc = await salesOrder.findOne().sort({ unique_id: -1 }).lean();
      let nextUniqueId = lastDoc ? lastDoc.unique_id + 1 : 1;

      for (let item of batch) {
        try {
          let itemDetailArr = [];
          let expense = {};

          // Parse item details
          if (item.ItemDetail) {
            if (typeof item.ItemDetail === "string") {
              itemDetailArr = parseItemDetailManually(item.ItemDetail);
            } else if (Array.isArray(item.ItemDetail)) {
              itemDetailArr = item.ItemDetail;
            }
          }

          const detail = itemDetailArr[0] || {};

          // Parse expense lines
          if (detail.SalesExpenseLines) {
            if (typeof detail.SalesExpenseLines === "string") {
              const expenseArr = debugParseJSON(
                detail.SalesExpenseLines,
                "SalesExpenseLines"
              );
              expense = expenseArr[0] || {};
            } else if (Array.isArray(detail.SalesExpenseLines)) {
              expense = detail.SalesExpenseLines[0] || {};
            }
          }

          const invoiceNo = item.BPL_IDAssignedToInvoice?.toString() || "";
          const isExistingRecord = existingRecordsMap.has(invoiceNo);
          const uniqueId = isExistingRecord
            ? existingRecordsMap.get(invoiceNo)
            : nextUniqueId++;

          // Prepare update data
          const updateData = {
            unique_id: uniqueId,
            invoice_no: invoiceNo,
            customer_code: item.CardCode || "",
            customer_name: item.CardName || "",
            discount_percent: safeNumber(item.DiscountPercent),
            posting_date: safeDate(item.DocDate),
            due_date: safeDate(item.DocDueDate),
            document_type: item.DocType || "",
            group_no: safeNumber(item.GroupNumber),
            account_code: detail.AccountCode || "",
            item_discount_percent: safeNumber(detail.DiscountPercent),
            item_code: detail.ItemCode || "",
            item_description: detail.ItemDescription || "",
            location: safeNumber(detail.LocationCode),
            unit_price: safeNumber(detail.Price),
            quantity: safeNumber(detail.Quantity),
            tax_code: detail.TaxCode || "",
            base_entry: safeNumber(item.U_BaseEntry),
            base_type: item.U_BaseType || "",
            warehouse_code: detail.WarehouseCode || "",
            customer_ref_no: item.NumAtCard || "",
            bill_code: item.PayToCode || "",
            round_off: item.Rounding || "",
            round_diff_amount: safeNumber(item.RoundingDiffAmount),
            sales_person: safeNumber(item.SalesPersonCode),
            document_series: item.Series || "",
            shipping_code: item.ShipToCode || "",
            tax_date: safeDate(item.TaxDate),
            art_work: item.U_Artwork || "",
            flim_development: item.U_FlimDevelopment || "",
            posting_status: item.U_Posted || "",
            document_no: safeNumber(item.U_SSODoc),
            transportation: item.U_Transportation || "",
          };

          bulkOperations.push({
            updateOne: {
              filter: { invoice_no: updateData.invoice_no },
              update: { $set: updateData },
              upsert: true,
            },
          });

          if (isExistingRecord) {
            updatedRecordsCount++;
          } else {
            newRecordsCount++;
          }

          successCount++;
        } catch (itemError) {
          console.error(
            `Error processing ${item.CardCode}:`,
            itemError.message
          );
          errorCount++;
        }
      }

      // Execute bulk operation for this batch
      if (bulkOperations.length > 0) {
        try {
          await salesOrder.bulkWrite(bulkOperations, { ordered: false });
          console.log(
            `Batch ${Math.floor(i / BATCH_SIZE) + 1} completed: ${
              bulkOperations.length
            } records`
          );
        } catch (bulkError) {
          console.error(
            `Batch ${Math.floor(i / BATCH_SIZE) + 1} failed:`,
            bulkError.message
          );
          errorCount += bulkOperations.length;
        }
      }
    }

    console.timeEnd("Total Sync Time");

    res.json({
      message: "SAP Data Sync Completed Successfully",
      totalProcessed: successCount,
      newRecords: newRecordsCount,
      updatedRecords: updatedRecordsCount,
      errors: errorCount,
      totalFromSAP: sapArray.length,
    });

    console.log(
      `Synchronization completed: ${successCount}/${sapArray.length} records processed (${newRecordsCount} new, ${updatedRecordsCount} updated)`
    );
  } catch (error) {
    console.error("SAP Fetch Error:", error);
    res.status(500).json({
      message: "Error fetching SAP data",
      error: error.message,
    });
  }
});

export default router;
