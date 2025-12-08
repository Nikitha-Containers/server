import express from "express";
import Design from "../../models/design/designSchema.js";

const router = express.Router();

// Add a Design

router.post("/add", async (req, res) => {
  try {
    const {
      saleorder_no,
      posting_date,
      quantity,
      machine,
      components,
      art_work,
      item_description,
      customer_name,
      due_date,
    } = req.body;

    if (!saleorder_no) {
      return res.status(400).json({ message: "Saleorder No is Required" });
    }
    const design = await Design.findOneAndUpdate(
      { saleorder_no },
      {
        saleorder_no,
        posting_date,
        quantity,
        machine,
        components,
        art_work,
        item_description,
        customer_name,
        due_date,
      }
    );

    res
      .status(201)
      .json({ success: true, message: "Desigan created Successfully", design });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get all Designs
router.get("/", async (req, res) => {
  try {
    const allDesign = await Design.find();
    res.status(200).json({ success: true, allDesign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
export default router;
