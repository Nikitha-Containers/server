import express from "express";
import bcrypt from "bcryptjs";
import userSchema from "../../models/users/userSchema.js";

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
  try {
    const { email, password, empID, empName, department, menu } = req.body;

    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await userSchema.create({
      email,
      password,
      empID,
      empName,
      department,
      menu,
    });

    res
      .status(201)
      .json({ success: true, message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userSchema.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    res.status(200).json({ success: true, message: "Login successful" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get All Users (Active & Inactive)
router.get("/all", async (req, res) => {
  try {
    const allUsers = await userSchema.find();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update User (with explicit password hashing)
router.put("/:userID", async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updateUser = await userSchema.findOneAndUpdate(
      { userID: req.params.userID },
      updateData,
      { new: true, runValidators: true }
    );

    if (!updateUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User Updated Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Soft Delete User (set status = 0)
router.put("/:userID/deactivate", async (req, res) => {
  try {
    const deleteUser = await userSchema.findOneAndUpdate(
      { userID: req.params.userID },
      { status: 0 },
      { new: true }
    );
    if (!deleteUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deactivated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Restore User (set status = 1)
router.put("/:userID/activate", async (req, res) => {
  try {
    const restoredUser = await userSchema.findOneAndUpdate(
      { userID: req.params.userID },
      { status: 1 },
      { new: true }
    );

    if (!restoredUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "User activated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete User Permanently
router.delete("/:userID", async (req, res) => {
  try {
    const deletedUser = await userSchema.findOneAndDelete({
      userID: req.params.userID,
    });
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "User deleted permanently" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
