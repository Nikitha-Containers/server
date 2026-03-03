import express from "express";
import salesOrder from "../../models/SalesOrder/SO_Schema.js";
import axios from "axios";

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
    const [datePart] = sapDate.split(" "); // "2025-10-03"
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  return null;
};

//SapSync
router.post("/sapSync", async (req, res) => {
  try {
    const sapURL =
      "http://180.235.121.59:19930/GET_SAP_API/SalesOrderDetails?FromDate=20251030&ToDate=20251030";

    const { data } = await axios.get(sapURL);

    let sapData = JSON.parse(data.Data[0].JSONRESULT);

    sapData = sapData.map((rec) => {
      return {
        account_code: rec?.AcctCode,
        carton_printing: rec?.["CARTON PRINTING"],
        card_code: rec.CardCode,
        customer_name: rec?.CardName,
        delivery: rec?.DELIVERY,
        doc_currency: rec?.DocCur,
        posting_date: normalizeSapDateTime(rec?.DocDate),
        due_date: normalizeSapDateTime(rec?.DocDueDate),
        saleorder_no: rec?.DocEntry,
        doc_number: rec?.DocNum,
        doc_rate: rec?.DocRate,
        file_ext: rec?.FileExt,
        file_name: rec?.FileName,
        film_develop_cost: rec?.["Film Develop Cost"],
        freight_charges_pm: rec?.["Freight CHARGES PM"],
        freight_charges_rm: rec?.["Freight CHARGES RM"],
        hsn_entry: rec?.HsnEntry,
        inside_coat: rec?.["INSIDE COAT/LAQUER"],
        insurance: rec?.Insurance,
        interest: rec?.Interest,
        item_code: rec?.ItemCode,
        item_description: rec?.ItemDescription,
        item_line_no: rec?.LineNum,
        item_line_total: rec?.LineTotal,
        item_thickness: rec?.["MATERIAL THICKNESS"],
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
        source_path: rec?.srcPath,
      };
    });

    //Save DB
    // await salesOrder.insertMany(sapData);

    const bulkUpsert = sapData.map((doc) => ({
      updateOne: {
        filter: {
          saleorder_no: doc.saleorder_no,
          item_line_no: doc.item_line_no,
        },
        update: { $set: doc },
        upsert: true,
      },
    }));

    let result;
    try {
      result = await salesOrder.bulkWrite(bulkUpsert);
    } catch (err) {
      if (err.code === 11000) {
        console.log("Duplicate SO + Line skipped");
      } else {
        throw err;
      }
    }

    const latestSync = await salesOrder
      .findOne()
      .sort({ updatedAt: -1 })
      .select("updatedAt");

    res.status(200).json({
      success: true,
      TotalRec: result?.upsertedCount,
      lastSync: latestSync?.updatedAt || new Date(),
      message: "SAP Data Sync Completed Successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "SAP Data Import Failed",
    });
  }
});

export default router;
