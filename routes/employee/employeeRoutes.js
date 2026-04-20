import express from "express";
import EmployeeInfo from "../../models/employee/employeeSchema.js";

const router = express.Router();

// Create
router.post("/create", async (req, res) => {
  try {
    const data = await EmployeeInfo.create(req.body);
    res
      .status(201)
      .json({ success: true, message: "Employee created successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get All
router.get("/all", async (req, res) => {
  try {
    const data = await EmployeeInfo.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get by type & machine_type (for dropdowns)
// Example: GET /employee/filter?emp_type=instructor&machine_type=coating

router.get("/filter", async (req, res) => {
  try {
    const { emp_type, machine_type } = req.query;
    const query = {};
    if (emp_type) query.emp_type = emp_type;
    if (machine_type) query.machine_type = machine_type;

    const data = await EmployeeInfo.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Single
router.get("/:id", async (req, res) => {
  try {
    const data = await EmployeeInfo.findById(req.params.id);
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update
router.put("/:id", async (req, res) => {
  try {
    const data = await EmployeeInfo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    res
      .status(200)
      .json({ success: true, message: "Employee updated successfully", data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const data = await EmployeeInfo.findByIdAndDelete(req.params.id);
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    res
      .status(200)
      .json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
