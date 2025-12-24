import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import userSchema from "../../models/user/userSchema.js";
import protect from "../../middlewares/authMiddleware.js";

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    {
      userID: user.userID,
      empID: user.empID,
      role: user.loginType,
      department: user.department,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.EXPIRES_IN }
  );
};

// Register User
router.post("/register", protect, async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const {
      email,
      password,
      empID,
      empName,
      department,
      ipAddress,
      pages,
      loginType = "User",
    } = req.body;

    // Safety: allow only Admin or User
    if (!["Admin", "User"].includes(loginType)) {
      return res.status(400).json({ message: "Invalid loginType" });
    }

    const sidemenus = pages?.toString() || "";

    const existingUser = await userSchema.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    await userSchema.create({
      email,
      password,
      empID,
      empName,
      department,
      ipAddress,
      sidemenus,
      loginType,
    });

    res.status(201).json({
      success: true,
      message: `${loginType} created successfully`,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Login User
router.post("/login", async (req, res) => {
  try {
    const { empID, password } = req.body;

    const user = await userSchema.findOne({ empID }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (user?.loginType === "Admin") {
      res.status(200).json({
        success: true,
        message: "Password correct, proceed to OTP verification",
        adminID: user.empID,
      });
    } else {
      const token = generateToken(user);

      res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        access: user?.department,
        sidemenus: user?.sidemenus,
        adminID: user.empID,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
    console.log("Error in login User", error);
  }
});

// Get All Users (Active & Inactive)
router.get("/all", protect, async (req, res) => {
  try {
    const allUsers = await userSchema.find({ loginType: "User" });
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update User (with explicit password hashing)
router.put("/:userID", async (req, res) => {
  try {
    const reqData = req.body?.updateData;

    const pages = Array.isArray(reqData.pages)
      ? reqData.pages.join(",")
      : reqData.pages;

    if (reqData?.pages) {
      reqData.sidemenus = pages;
    }

    if (reqData?.password) {
      reqData.password = await bcrypt.hash(reqData?.password, 10);
    }

    const updateUser = await userSchema.findOneAndUpdate(
      { userID: req.params.userID },

      reqData,

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
    console.log("Error in updating User", error);
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

// Veridy Otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { empID, otp } = req.body;

    const admin = await userSchema
      .findOne({ empID, loginType: "Admin" })
      .select("+authCode");

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const verifyOTP = speakeasy.totp.verify({
      secret: admin.authCode,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!verifyOTP) {
      return res
        .status(401)
        .json({ message: "Invalid OTP. Please try again !" });
    }

    const token = generateToken(admin);

    res.json({
      success: true,
      message: "Login successful with OTP",
      token,
      access: admin?.department,
      sidemenus: admin?.sidemenus,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
    console.log("error fetching Verify otp", error);
  }
});

export default router;
