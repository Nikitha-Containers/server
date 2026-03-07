import express from "express";
import salesOrder from "../../models/SalesOrder/SO_Schema.js";

const router = express.Router();

// Get all
router.get("/", async (req, res) => {
  try {
    const data = await salesOrder.find();

    const latestSync = await salesOrder
      .findOne()
      .sort({ sap_sync_time: -1 })
      .select("sap_sync_time");

    res.status(200).json({
      success: true,
      data,
      lastSync: latestSync?.sap_sync_time  || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel Sales Order (Soft Delete)
router.put("/:unique_id", async (req, res) => {
  try {
    const cancelOrder = await salesOrder.findOneAndUpdate(
      { unique_id: req.params.unique_id },
      { status: 0 },
      { new: true },
    );

    if (!cancelOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      success: true,
      message: "Sales Order Cancelled",
      data: cancelOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
