import express from "express";
import salesOrder from "../../models/SalesOrder/SO_Schema.js";

const router = express.Router();

// Get all
router.get("/", async (req, res) => {
  try {
    const data = await salesOrder.find();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const update = await salesOrder.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    );

    if (!update) return res.status(404).json({ message: "Not found" });

    res.json({ success: true, data: update });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
