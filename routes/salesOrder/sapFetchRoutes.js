import express from "express";
import salesOrder from "../../models/SalesOrder/SO_Schema.js";
import axios from "axios";

const router = express.Router();

//SapSync
router.post("/sapSync", async (req, res) => {
  try {
    const sapURL =
      "http://180.235.121.59:19930/GET_SAP_API/SalesOrderDetails?FromDate=20251003&ToDate=20251003";

    const { data } = await axios.get(sapURL);

    let sapData = JSON.parse(data.Data[0].JSONRESULT);

    sapData = sapData.map((rec) => {
      let itemDetails = JSON.parse(rec?.ItemDetail);
      itemDetails = itemDetails[0];

      return {
        invoice_no: rec?.BPL_IDAssignedToInvoice || "",
        saleorder_no: rec?.CardCode || "",
        customer_name: rec?.CardName || "",
        comments: rec?.Comments || "",
        discount_percent: rec?.DiscountPercent || 0,
        posting_date: rec?.DocDate || null,
        due_date: rec?.DocDueDate || null,
        document_type: rec?.DocType || "",
        group_no: rec?.GroupNumber || 0,

        //Item Details Strat Here
        account_code: itemDetails?.AcctCode || "",
        item_discount_percent: itemDetails?.DiscountPercent || 0,
        item_code: itemDetails?.ItemCode || "",
        item_description: itemDetails?.ItemDescription || "",
        item_line_no: itemDetails?.LineNum || 0,
        item_location_code: itemDetails?.LocationCode || 0,
        item_price: itemDetails?.Price || 0,
        item_quantity: itemDetails?.Quantity || 0,
        item_tax_code: itemDetails?.TaxCode || "",
        item_u_baseentry: itemDetails?.U_BaseEntry || 0,
        item_u_basetype: itemDetails?.U_BaseType || "",
        item_warehouse_code: itemDetails?.WarehouseCode || 0,
        //Item Details End Here

        customer_ref_no: rec?.NumAtCard || "",
        bill_code: rec?.PayToCode || "",
        round_off: rec?.Rounding || "",
        round_diff_amount: rec?.RoundingDiffAmount || 0,
        sales_person_code: rec?.SalesPersonCode || 0,
        document_series: rec?.Series || "",
        shipto_code: rec?.ShipToCode || "",
        tax_date: rec?.TaxDate || null,
        u_baseentry: rec?.U_BaseEntry || 0,
        u_basetype: rec?.U_BaseType || "",
        u_posted: rec?.U_Posted || "",
        u_ssodentry: rec?.U_SSODEntry || 0,
        u_ssodoc: rec?.U_SSODoc || 0,
      };
    });

    //Save DB
    await salesOrder.insertMany(sapData);

    const latestSync = await salesOrder
      .findOne()
      .sort({ updatedAt: -1 })
      .select("updatedAt");

    res.status(200).json({
      success: true,
      TotalRec: sapData.length,
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
