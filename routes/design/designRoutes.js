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
      unique_id,
      saleorder_no,
      item_line_no,
      posting_date,
      customer_name,
      sales_employee,
      telephone,
      item_description,
      item_quantity,
      machine,
      art_work,
      components,
      due_date,
      file_name,
      file_ext,
      thickness,

      // Design
      design_pending_details,
      design_status,

      // Printing Manager
      printingmanager_pending_details,
      printingmanager_status,

      //Flim Plate
      flimplate_pending_reason,
      flim_plate_status,

      // Planning
      planning_work_details,
      planning_pending_details,
      planning_status,

      // Coating
      coating_work_details,
      coating_pending_details,
      coating_status,

      // Printing Team
      printingteam_work_details,
      printingteam_pending_details,
      printingteam_status,

      // Varnish
      varnish_work_details,
      varnish_pending_details,
      varnish_status,

      // Fabrication

      fabrication_work_details,
      fabrication_pending_details,
      fabrication_status,
    } = req.body;

    let componentData = safeParse(components) || {};

    const existingDesign = await Design.findOne({ unique_id });

    // Design
    let finalDesignPendingDetails =
      existingDesign?.design_pending_details || {};
    if (design_pending_details) {
      finalDesignPendingDetails = safeParse(design_pending_details);
    }

    const finalDesignStatus = design_status ?? existingDesign?.design_status;

    // Printing Manager
    let finalPrintingPendingDetails =
      existingDesign?.printingmanager_pending_details || {};
    if (printingmanager_pending_details) {
      finalPrintingPendingDetails = safeParse(printingmanager_pending_details);
    }

    const finalPrintingManagerStatus =
      printingmanager_status ?? existingDesign?.printingmanager_status;

    // Flim Plate
    let finalFlimPlatePendingReason =
      existingDesign?.flimplate_pending_reason || {};
    if (flimplate_pending_reason) {
      finalFlimPlatePendingReason = safeParse(flimplate_pending_reason);
    }

    const finalFlimPlateStatus =
      flim_plate_status ?? existingDesign?.flim_plate_status;

    // Planning Team
    let finalPlanningWorkDetails = existingDesign?.planning_work_details || {};
    if (planning_work_details) {
      finalPlanningWorkDetails = safeParse(planning_work_details);
    }

    let finalPlanningPendingDetails =
      existingDesign?.planning_pending_details || {};
    if (planning_pending_details) {
      finalPlanningPendingDetails = safeParse(planning_pending_details);
    }

    const finalPlanningStatus =
      planning_status ?? existingDesign?.planning_status;

    //Coating
    let finalCoatingWorkDetails = existingDesign?.coating_work_details || {};
    if (coating_work_details) {
      finalCoatingWorkDetails = safeParse(coating_work_details);
    }

    let finalCoatingPendingDetails =
      existingDesign?.coating_pending_details || {};
    if (coating_pending_details) {
      finalCoatingPendingDetails = safeParse(coating_pending_details);
    }

    const finalCoatingStatus = coating_status ?? existingDesign?.coating_status;

    // Printing Team
    let finalPrintingteamWorkDetails =
      existingDesign?.printingteam_work_details || {};
    if (printingteam_work_details) {
      finalPrintingteamWorkDetails = safeParse(printingteam_work_details);
    }

    let finalPrintingteamPendingDetails =
      existingDesign?.printingteam_pending_details || {};
    if (printingteam_pending_details) {
      finalPrintingteamPendingDetails = safeParse(printingteam_pending_details);
    }

    const finalPrintingteamStatus =
      printingteam_status ?? existingDesign?.printingteam_status;

    // Varnish
    let finalVarnishWorkDetails = existingDesign?.varnish_work_details || {};
    if (varnish_work_details) {
      finalVarnishWorkDetails = safeParse(varnish_work_details);
    }

    let finalVarnishPendingDetails =
      existingDesign?.varnish_pending_details || {};
    if (varnish_pending_details) {
      finalVarnishPendingDetails = safeParse(varnish_pending_details);
    }

    const finalVarnishStatus = varnish_status ?? existingDesign?.varnish_status;

    // Fabrication
    let finalFabricationWorkDetails =
      existingDesign?.fabrication_work_details || {};
    if (fabrication_work_details) {
      finalFabricationWorkDetails = safeParse(fabrication_work_details);
    }

    let finalFabricationPendingDetails =
      existingDesign?.fabrication_pending_details || {};
    if (fabrication_pending_details) {
      finalFabricationPendingDetails = safeParse(fabrication_pending_details);
    }

    const finalFabricationStatus =
      fabrication_status ?? existingDesign?.fabrication_status;

    if (existingDesign?.components) {
      Object.entries(existingDesign.components).forEach(([name, comp]) => {
        if (componentData[name]) {
          componentData[name] = {
            ...comp,
            ...componentData[name],
          };
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
      unique_id,
      saleorder_no,
      item_line_no,
      posting_date,
      item_quantity,
      machine,
      components: componentData,
      art_work,
      item_description,
      customer_name,
      sales_employee,
      telephone,
      due_date,
      file_name,
      file_ext,
      thickness,

      // Design
      design_pending_details: finalDesignPendingDetails,
      design_status: finalDesignStatus,

      // Printing Manager
      printingmanager_pending_details: finalPrintingPendingDetails,
      printingmanager_status: finalPrintingManagerStatus,

      //Flim Plate
      flimplate_pending_reason: finalFlimPlatePendingReason,
      flim_plate_status: finalFlimPlateStatus,

      // Planning
      planning_work_details: finalPlanningWorkDetails,
      planning_pending_details: finalPlanningPendingDetails,
      planning_status: finalPlanningStatus,

      // Coating
      coating_work_details: finalCoatingWorkDetails,
      coating_pending_details: finalCoatingPendingDetails,
      coating_status: finalCoatingStatus,

      // Printing Team
      printingteam_work_details: finalPrintingteamWorkDetails,
      printingteam_pending_details: finalPrintingteamPendingDetails,
      printingteam_status: finalPrintingteamStatus,

      //Varnish
      varnish_work_details: finalVarnishWorkDetails,
      varnish_pending_details: finalVarnishPendingDetails,
      varnish_status: finalVarnishStatus,

      // Fabrication
      fabrication_work_details: finalFabricationWorkDetails,
      fabrication_pending_details: finalFabricationPendingDetails,
      fabrication_status: finalFabricationStatus,
    };

    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const design = await Design.findOneAndUpdate(
      { unique_id },
      { $set: updateData },
      { new: true, upsert: true },
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

export default router;
