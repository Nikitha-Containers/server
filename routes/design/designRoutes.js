import express from "express";
import Design from "../../models/design/designSchema.js";
import { uploadComp } from "../../middlewares/multer.js";

const router = express.Router();

// Add a Design

const safeParse = (value) => {
  try {
    if (!value) return null;
    if (typeof value === "string") return JSON.parse(value);
    if (typeof value === "object") return value;
    return null;
  } catch (err) {
    console.error("JSON parse failed:", value);
    return null;
  }
};

router.post("/add", uploadComp.any(), async (req, res) => {
  try {
    const {
      saleorder_no,
      posting_date,
      customer_name,
      sales_person_code,
      item_description,
      item_quantity,
      machine,
      art_work,
      components,
      due_date,

      design_pending_details,
      design_status,

      printingmanager_pending_details,
      printingmanager_status,

      planning_work_details,
      planning_pending_details,
      planning_status,

      coating_work_details,
      coating_pending_details,
      coating_status,
    } = req.body;

    if (!saleorder_no || saleorder_no.trim() === "") {
      return res.status(400).json({ message: "Saleorder No is Required" });
    }
    let componentData = safeParse(components) || {};

    const existingDesign = await Design.findOne({ saleorder_no });

    const finalDesignStatus = design_status ?? existingDesign?.design_status;

    const finalPrintingStatus =
      printingmanager_status ?? existingDesign?.printingmanager_status;

    const finalPlanningStatus =
      planning_status ?? existingDesign?.planning_status;

    const finalCoatingStatus = coating_status ?? existingDesign?.coating_status;

    let finalDesignPendingDetails =
      existingDesign?.design_pending_details || {};

    if (design_pending_details) {
      finalDesignPendingDetails = safeParse(design_pending_details);
    }

    let finalPrintingPendingDetails =
      existingDesign?.printingmanager_pending_details || {};

    if (printingmanager_pending_details) {
      finalPrintingPendingDetails = safeParse(printingmanager_pending_details);
    }

    let finalPlanningWorkDetails = existingDesign?.planning_work_details || {};

    if (planning_work_details) {
      finalPlanningWorkDetails = safeParse(planning_work_details);
    }

    let finalPlanningDetails = existingDesign?.planning_pending_details || {};

    if (planning_pending_details) {
      finalPlanningDetails = safeParse(planning_pending_details);
    }

    let finalCoatingDetails = existingDesign?.coating_pending_details || {};

    if (coating_pending_details) {
      finalCoatingDetails = safeParse(coating_pending_details);
    }

    let finalCoatingWorkDetails = existingDesign?.coating_work_details || {};

    if (planning_work_details) {
      finalCoatingWorkDetails = safeParse(coating_work_details);
    }

    if (existingDesign?.components) {
      Object.entries(existingDesign.components).forEach(([name, comp]) => {
        if (componentData[name] && !componentData[name].file && comp.file) {
          componentData[name].file = comp.file;
        }
      });
    }

    if (!components && existingDesign?.components) {
      componentData = existingDesign.components;
    }

    req.files?.forEach((file) => {
      const componentName = file.fieldname;
      if (!componentData[componentName]) componentData[componentName] = {};
      componentData[componentName].file = file.filename;
    });

    const updateData = {
      saleorder_no,
      posting_date,
      item_quantity,
      machine,
      components: componentData,
      art_work,
      item_description,
      customer_name,
      sales_person_code,
      due_date,

      design_pending_details: finalDesignPendingDetails,
      design_status: finalDesignStatus,

      printingmanager_pending_details: finalPrintingPendingDetails,
      printingmanager_status: finalPrintingStatus,

      planning_work_details: finalPlanningWorkDetails,
      planning_pending_details: finalPlanningDetails,
      planning_status: finalPlanningStatus,

      coating_work_details: finalDesignPendingDetails,
      coating_pending_details: finalCoatingDetails,
      coating_status: finalCoatingStatus,
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key]
    );

    const design = await Design.findOneAndUpdate(
      { saleorder_no },
      { $set: updateData },
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
