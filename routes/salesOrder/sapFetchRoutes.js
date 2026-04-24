import express from "express";
import salesOrder from "../../models/SalesOrder/SO_Schema.js";
import axios from "axios";
import cron from "node-cron";

const router = express.Router();

const normalizeSapDateTime = (sapDate) => {
  if (!sapDate) return null;

  // If already Date object
  if (sapDate instanceof Date) {
    return new Date(
      sapDate.getFullYear(),
      sapDate.getMonth(),
      sapDate.getDate(),
    );
  }

  if (typeof sapDate === "string") {
    const [datePart] = sapDate.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return null;
};

// For null values

const clean = (val) => (val === "NULL" ? null : val);

// SAP Sync Function

let isSyncRunning = false;

const runSapSync = async () => {
  if (isSyncRunning) {
    console.log("SAP Sync already running...");
    return;
  }

  isSyncRunning = true;

  try {
    const today = new Date();

    const formatDate = (d) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

    const todayStr = formatDate(today);

    const sapURL = `http://180.235.121.59:19930/GET_SAP_API/SalesOrderDetails?FromDate=${todayStr}&ToDate=${todayStr}`;

    const { data } = await axios.get(sapURL);

    let sapData = data?.Data?.[0]?.JSONRESULT
      ? JSON.parse(data.Data[0].JSONRESULT)
      : [];

    sapData = sapData.map((rec) => {
      const saleorder_no = rec?.DocNum;
      const item_line_no = rec?.LineNum;
      const syncTime = new Date();

      return {
        unique_id: `SO_${saleorder_no}_${item_line_no}`,
        sap_sync_time: syncTime,
        account_code: rec?.AcctCode,
        carton_printing: rec?.["CARTON PRINTING"],
        card_code: rec.CardCode,
        customer_name: rec?.CardName,
        delivery: rec?.DELIVERY,
        doc_currency: rec?.DocCur,
        posting_date: normalizeSapDateTime(rec?.DocDate),
        due_date: normalizeSapDateTime(rec?.DocDueDate),
        saleorder_no: saleorder_no,
        doc_entry: rec?.DocEntry,
        doc_rate: rec?.DocRate,
        file_ext: clean(rec?.FileExt),
        file_name: clean(rec?.FileName),
        film_develop_cost: rec?.["Film Develop Cost"],
        freight_charges_pm: rec?.["Freight CHARGES PM"],
        freight_charges_rm: rec?.["Freight CHARGES RM"],
        hsn_entry: rec?.HsnEntry,
        inside_coat: rec?.["INSIDE COAT/LAQUER"],
        insurance: rec?.Insurance,
        interest: rec?.Interest,
        item_code: rec?.ItemCode,
        item_description: rec?.ItemDescription,
        item_line_no: item_line_no,
        item_line_total: rec?.LineTotal,
        thickness: rec?.["MATERIAL THICKNESS"]
          ? rec["MATERIAL THICKNESS"].replace(/mm/i, "").trim()
          : null,
        customer_ref_no: rec?.NumAtCard,
        outside_lid_or_bottom: rec?.["OUTSIDE LID/BOTTOM"],
        other_freight: rec?.["Other Freight"],
        packing_mode: rec?.["PACKING MODE"],
        plain_or_printed: rec?.["PLAIN/PRINTED"],
        packing_and_forward: rec?.["Packing & Forwarding"],
        bill_code: rec?.PayToCode,
        item_price: rec?.Price,
        quantity_validity: rec?.["QUOTATION VALIDITY"],
        item_quantity: rec?.Quantity,
        shape_of_tin: rec?.["SHAPE OF TIN"],
        spl_instruction: rec?.["SPL INSTRUCTION"],
        sales_employee: rec?.SalesEmployee,
        series: rec?.Series,
        ship_to_code: rec?.ShipToCode,
        tolerance: rec?.TOLERANCE,
        typeof_material: rec?.["TYPE OF MATERIAL"],
        item_tax_code: rec?.TaxCode,
        tax_date: normalizeSapDateTime(rec?.TaxDate),
        telephone: rec?.TelePhone === "NULL" ? null : rec?.TelePhone,
        tool_and_diecost: rec?.["Tool And Die Cost"],
        total_expense: rec?.["Total Expense"],
        window: rec?.WINDOW,
        item_warehouse_code: rec?.WarehouseCode,
        source_path: clean(rec?.srcPath),
      };
    });

    //Save DB
    // await salesOrder.insertMany(sapData);

    const bulkUpsert = sapData.map((doc) => ({
      updateOne: {
        filter: { unique_id: doc?.unique_id },
        update: { $set: doc },
        upsert: true,
      },
    }));

    const result = await salesOrder.bulkWrite(bulkUpsert);

    return {
      total: result?.upsertedCount,
    };
  } catch (error) {
    console.error("SAP Sync Failed:", error.message);
    throw error;
  } finally {
    isSyncRunning = false;
  }
};

//  API Route (Manual Run)
router.post("/sapSync", async (req, res) => {
  try {
    const result = await runSapSync();

    res.status(200).json({
      success: true,
      TotalRec: result.total,
      message: "SAP Data Sync Completed",
    });
  } catch (error) {
    console.error("SAP Sync Failed:", error.message);

    res.status(500).json({
      success: false,
      message: "SAP Sync Failed",
    });
  }
});

// AUTO SYNC EVERY DAY 10:00 AM
cron.schedule(
  "0 10 * * *",
  async () => {
    console.log("Running Auto SAP Sync (10:00 AM)");
    await runSapSync();
  },
  {
    timezone: "Asia/Kolkata",
  },
);
export default router;
