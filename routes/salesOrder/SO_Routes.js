import express from "express";
import SalesOrder from "../../models/salesOrder/SO_Schema.js";

const router = express.Router();

// Create Sales Order

router.post("/salesorder", async (req, res) => {
  try {
    const { SO_Number } = req.body;
    const existingSalesOrder = await SalesOrder.findOne({ SO_Number });
    if (existingSalesOrder) {
      return res
        .status(400)
        .json({ success: false, message: "Sales order already exists" });
    }

    const newOrder = new SalesOrder(req.body);
    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Sales Order Created Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get All Sales Order

router.get("/", async (req, res) => {
  try {
    const salesOrders = await SalesOrder.find();
    if (!salesOrders.length) {
      return res
        .status(404)
        .json({ success: false, message: "No sales orders found" });
    }
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Sales Order By SO_Number

router.get("/:SO_Number", async (req, res) => {
  try {
    const singleOrder = await SalesOrder.findOne({
      SO_Number: req.params.SO_Number,
    });
    if (!singleOrder) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }
    res.status(200).json({ success: true, singleOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update Sales Order

router.put("/update/:SO_Number", async (req, res) => {
  try {
    const updateSalesOrder = await SalesOrder.findOneAndUpdate(
      { SO_Number: req.params.SO_Number },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updateSalesOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Sales Order not found" });
    }

    res.status(200).json({
      success: true,
      message: "Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Delete Sales Order

router.delete("/:SO_Number", async (req, res) => {
  try {
    const deleteOrder = await SalesOrder.findOneAndDelete({
      SO_Number: req.params.SO_Number,
    });

    if (!deleteOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Sales order not found" });
    }

    res.status(200).json({ success: true, message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
