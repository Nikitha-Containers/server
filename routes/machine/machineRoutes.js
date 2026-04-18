import express from "express";
import MachineInfo from "../../models/machine/machineSchema.js";

const router = express.Router();

// Create a new Machine
router.post("/create", async (req, res) => {
  try {
    const data = await MachineInfo.create(req.body);

    res.status(201).json({
      success: true,
      message: "Machine created successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Get all machines
router.get("/all", async (req, res) => {
  try {
    const data = await MachineInfo.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Get Single Machine
router.get("/:id", async (req, res) => {
  try {
    const data = await MachineInfo.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Machine not found",
      });
    }

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Update machine
router.put("/:id", async (req, res) => {
  try {
    const data = await MachineInfo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Machine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Machine updated successfully",
      data,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete Machine
router.delete("/:id", async (req, res) => {
  try {
    const data = await MachineInfo.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Machine not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Machine deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
