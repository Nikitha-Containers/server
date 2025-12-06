import express from "express";
import Design from "../../models/design/designSchema.js";
import {
  uploadDesignFiles,
  FIELD_COMPONENT_MAP,
} from "../../middlewares/multerConfig.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Get upload directory path from multerConfig
const uploadDir = path.join(process.cwd(), "uploads", "designs");

// Helper function to delete file safely
const deleteFileSafely = (filePath) => {
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } catch (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    }
  }
};

// Clean up uploaded files in case of error
const cleanupUploadedFiles = (files, saleorderNo) => {
  if (files) {
    Object.values(files)
      .flat()
      .forEach((file) => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
  }
};

router.post("/add", uploadDesignFiles, async (req, res) => {
  try {
    const { saleorder_no } = req.body;
    if (!saleorder_no)
      return res
        .status(400)
        .json({ success: false, error: "`saleorder_no` is required" });

    let design = await Design.findOne({ saleorder_no });

    // Prepare update data
    const basicFields = [
      "posting_date",
      "machine",
      "totalQty",
      "art_work",
      "size",
      "customer_name",
      "start_date",
      "end_date",
    ];
    const updateData = { saleorder_no };

    // Process basic fields
    basicFields.forEach((field) => {
      if (req.body[field]) {
        if (field.includes("date")) {
          updateData[field] = new Date(req.body[field]);
        } else {
          updateData[field] = req.body[field];
        }
      }
    });

    // Initialize or get existing components
    const components = design?.components || {};

    // Handle file uploads and component data
    for (const [fieldName, componentName] of Object.entries(
      FIELD_COMPONENT_MAP
    )) {
      // Parse JSON data if sent
      const dataField = fieldName.replace("_file", "_data");
      let componentData = {};
      if (req.body[dataField]) {
        try {
          componentData = JSON.parse(req.body[dataField]);
        } catch (err) {
          console.error(`Failed parsing ${dataField}:`, err);
        }
      }

      // Handle file upload
      if (req.files?.[fieldName]?.[0]) {
        const file = req.files[fieldName][0];
        componentData = {
          ...componentData,
          fileName: file.filename,
          selected: true,
        };

        // Delete old file if exists
        const oldFileName = design?.components?.[componentName]?.fileName;
        if (oldFileName) {
          const oldFilePath = path.join(uploadDir, saleorder_no, oldFileName);
          deleteFileSafely(oldFilePath);
        }
      }

      // Only update if we have data
      if (Object.keys(componentData).length > 0) {
        components[componentName] = {
          ...components[componentName],
          ...componentData,
        };
      }
    }

    updateData.components = components;

    const created = !design;

    try {
      design = design
        ? await Design.findOneAndUpdate(
            { saleorder_no },
            { $set: updateData },
            { new: true, runValidators: true }
          )
        : await Design.create(updateData);

      res.status(200).json({
        success: true,
        message: created
          ? "Design created successfully"
          : "Design updated successfully",
        design,
      });
    } catch (dbError) {
      // Clean up uploaded files if DB operation fails
      cleanupUploadedFiles(req.files, saleorder_no);
      throw dbError;
    }
  } catch (err) {
    console.error("Error in /add:", err);

    // Clean up uploaded files if error occurs
    cleanupUploadedFiles(req.files, req.body.saleorder_no);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get All Designs
router.get("/", async (req, res) => {
  try {
    const allDesign = await Design.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, allDesign });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get Single Design by saleorder_no
router.get("/:saleorder_no", async (req, res) => {
  try {
    const { saleorder_no } = req.params;
    const design = await Design.findOne({ saleorder_no });

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
