import express from "express";
import SO_Schema from "../../models/SalesOrder/SO_Schema.js";

const router = express.Router();

// Get All Sales Order
router.get("/salesorder", async (req, res) => {
  try {
    const salesOrders = await SO_Schema.find();
    res.status(200).json({ success: true, salesOrders });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
});

// Update Sales Order
router.put("/salesorderupdate", async (req, res) => {
  try {
    const updateOrders = await SO_Schema.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updateOrders) {
      return res.status(400).json({ message: "Sales Order not found " });
    }
    res
      .status(200)
      .json({ success: true, message: "Sales Order updated successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
});
