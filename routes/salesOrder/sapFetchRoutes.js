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

    // Process in batches
    for (let i = 0; i < sapArray.length; i += BATCH_SIZE) {
      const batch = sapArray.slice(i, i + BATCH_SIZE);
      const bulkOperations = [];

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
          // Prepare update data
          const updateData = {
            invoice_no: safeNumber(item.BPL_IDAssignedToInvoice),
            saleorder_no: item.CardCode,
            customer_name: item.CardName,
            item_code: detail.ItemCode || "",
            item_description: detail.ItemDescription || "",
            quantity: safeNumber(detail.Quantity),
            unit_price: safeNumber(detail.Price),
            warehouse_code: detail.WarehouseCode || "",
            location_code: safeNumber(detail.LocationCode),
            tax_code: detail.TaxCode || "",
            account_code: detail.AccountCode || "",
            discount_percent: safeNumber(item.DiscountPercent),
            art_work: item.U_Artwork || "",
            flim_development: item.U_FlimDevelopment || "",
            sales_person: safeNumber(item.SalesPersonCode),
            order_date: safeDate(item.DocDate),
            delivery_date: safeDate(item.DocDueDate),
            base_entry: safeNumber(item.U_BaseEntry),
            base_type: item.U_BaseType || "",

            // DocType: item.DocType,
            // GroupNumber: safeNumber(item.GroupNumber),
            // TaxCode: detail.TaxCode || "",
            // DistributionRule: expense.DistributionRule || "",
            // DistributionRule2: expense.DistributionRule2 || "",
            // DistributionRule3: expense.DistributionRule3 || "",
            // ExpenseCode: safeNumber(expense.ExpenseCode),
            // LineGross: safeNumber(expense.LineGross),
            // LineTotal: safeNumber(expense.LineTotal),
            // Sales_TaxCode: expense.TaxCode || "",
            // U_AccQty: safeNumber(detail.U_AccQty),
            // U_BOMType: detail.U_BOMType || "",
            // U_Carton_Printing_If_Specified:
            //   detail.U_Carton_Printing_If_Specified || "",
            // U_DLVR_Schedule: detail.U_DLVR_Schedule || "",
            // U_DesQty: safeNumber(detail.U_DesQty),
            // U_HldQty: safeNumber(detail.U_HldQty),
            // U_Inside_Coating_Lacquering:
            //   detail.U_Inside_Coating_Lacquering || "",
            // U_Outside_For_LID_BOTTOM: detail.U_Outside_For_LID_BOTTOM || "",
            // U_Packing_Mode: detail.U_Packing_Mode || "",
            // U_QA: detail.U_QA || "",
            // U_QCStatus: detail.U_QCStatus || "",
            // U_Quotation_Validity: detail.U_Quotation_Validity || "",
            // U_RejQty: safeNumber(detail.U_RejQty),
            // U_SampQty: safeNumber(detail.U_SampQty),
            // U_Shape_Of_TIN: detail.U_Shape_Of_TIN || "",
            // U_TIN_Printed_Plain: detail.U_TIN_Printed_Plain || "",
            // U_TLRNC_in_Ord_Qty: detail.U_TLRNC_in_Ord_Qty || "",
            // U_Thickness_Of_Material: detail.U_Thickness_Of_Material || "",
            // U_Type_Of_Material_to_be_Used:
            //   detail.U_Type_Of_Material_to_be_Used || "",
            // U_CType: item.U_CType || "",
            // U_FlimDevelopment: item.U_FlimDevelopment || "",
            // U_LocCode: item.U_LocCode || "",
            // U_PType: item.U_PType || "",
            // U_Posted: item.U_Posted || "",
            // U_SCQty: safeNumber(item.U_SCQty),
            // U_SSODEntry: safeNumber(item.U_SSODEntry),
            // U_SSODoc: safeNumber(item.U_SSODoc),
            // U_Transportation: item.U_Transportation || "",
            // U_panvalue: safeNumber(item.U_panvalue),
            // U_purvalue: safeNumber(item.U_purvalue),
            // PayToCode: item.PayToCode || "",
            // Rounding: item.Rounding || "",
            // RoundingDiffAmount: safeNumber(item.RoundingDiffAmount),
            // Series: item.Series || "",
            // ShipToCode: item.ShipToCode || "",
            // TaxDate: safeDate(item.TaxDate),
          };
          bulkOperations.push({
            updateOne: {
              filter: { invoice_no: updateData.invoice_no },
              update: { $set: updateData },
              upsert: true,
            },
          });

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
      message: "SAP Data Sync Completed",
      success: successCount,
      errors: errorCount,
      total: sapArray.length,
    });

    console.log(
      `Synchronization completed: ${successCount}/${sapArray.length} records processed successfully...⚡`
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
