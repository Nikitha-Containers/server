import express from "express";
import Design from "../../models/upsDesign/designSchema.js";

const router = express.Router();

router.post("/upsDesign", async (req, res) => {
  try {
    const design = new Design({
      saleorder_no: req.body.soNumber,
      posting_date: req.body.soDate,
      fab_site: req.body.fabSite,
      job_name: req.body.jobName,
      components: req.body.components,
    });

    await design.save();
    res
      .status(201)
      .json({ success: true, message: "UpsDesign saved successfully", design });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const UpsDesign = await Design.find();
    res.status(200).json({ success: true, UpsDesign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
