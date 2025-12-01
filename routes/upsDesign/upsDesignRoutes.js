import express from "express";
import Design from "../../models/upsDesign/designSchema.js";

const router = express.Router();

router.post("/upsDesign", async (req, res) => {
  try {
    const { soNumber, soDate, machine, totalQty, components } = req.body;

    const design = await Design.findOneAndUpdate(
      { saleorder_no: soNumber },
      {
        saleorder_no: soNumber,
        posting_date: soDate,
        machine: machine,
        totalQty: totalQty,
        components: components,
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: `Design saved/updated successfully`,
      design,
    });
  } catch (error) {
    console.error("Error saving/updating design:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});
export default router;
