import express from "express";
import Design from "../../models/design/designSchema.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const {
      saleorder_no,
      posting_date,
      machine,
      totalQty,
      art_work,
      size,
      customer_name,
      start_date,
      end_date,
      components,
    } = req.body;

    if (!saleorder_no) {
      return res
        .status(400)
        .json({ success: false, error: "`saleorder_no` is required" });
    }

    // Prepare update data
    const updateData = {
      saleorder_no,
      posting_date: posting_date ? new Date(posting_date) : undefined,
      machine,
      totalQty,
      art_work,
      size,
      customer_name,
      start_date: start_date ? new Date(start_date) : undefined,
      end_date: end_date ? new Date(end_date) : undefined,
      components: components || {},
    };

    // Check if design exists
    let existing = await Design.findOne({ saleorder_no });

    let design;
    if (existing) {
      // Update existing design
      design = await Design.findOneAndUpdate(
        { saleorder_no },
        { $set: updateData },
        { new: true }
      );
    } else {
      // Create new design
      design = await Design.create(updateData);
    }

    res.status(200).json({
      success: true,
      message: existing
        ? "Design updated successfully"
        : "Design created successfully",
      design,
    });
  } catch (error) {
    console.error("Error in /design/add:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const allDesign = await Design.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, allDesign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/:saleorder_no", async (req, res) => {
  try {
    const design = await Design.findOne({
      saleorder_no: req.params.saleorder_no,
    });

    if (!design) {
      return res.status(404).json({
        success: false,
        error: "Design not found",
      });
    }

    res.status(200).json({ success: true, design });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
