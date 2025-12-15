import express from "express";
import Design from "../../models/design/designSchema.js";
import { uploadComp } from "../../middlewares/multer.js";

const router = express.Router();

// Add a Design

router.post("/add", uploadComp.any(), async (req, res) => {
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

    if (!saleorder_no || saleorder_no.trim() === "") {
      return res.status(400).json({ message: "Saleorder No is Required" });
    }

    let componentData = JSON.parse(components || "{}");

    const existingDesign = await Design.findOne({ saleorder_no });

    if (existingDesign?.components) {
      Object.entries(existingDesign.components).forEach(([name, comp]) => {
        if (componentData[name] && !componentData[name].file && comp.file) {
          componentData[name].file = comp.file;
        }
      });
    }

    req.files?.forEach((file) => {
      const componentName = file.fieldname;
      if (!componentData[componentName]) componentData[componentName] = {};
      componentData[componentName].file = file.filename;
    });

    const design = await Design.findOneAndUpdate(
      { saleorder_no },
      {
        saleorder_no,
        posting_date,
        quantity,
        machine,
        components: componentData,
        art_work,
        item_description,
        customer_name,
        due_date,
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: "Design saved successfully",
      design,
    });
  } catch (error) {
    console.error(error);
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

// Update or Insert Design

router.put("/:saleorder_no", async (req, res) => {
  try {
    const { components } = req.body;

    const updateQuery = {};

    Object.entries(components || {}).forEach(([compName, data]) => {
      if (data.coating) {
        updateQuery[`components.${compName}.coating`] = data.coating;
      }

      if (data.printingColor) {
        updateQuery[`components.${compName}.printingColor`] =
          data.printingColor;
      }
    });

    const updateComponent = await Design.findOneAndUpdate(
      {
        saleorder_no: req.params.saleorder_no,
      },
      { $set: updateQuery },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Printing Manager Design Saved Successsfully ",
      updateComponent,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
