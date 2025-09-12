import dotenv from "dotenv";
dotenv.config();
import adminSchema from "../../models/admin/adminSchema.js";
import express from "express";
import speakeasy from "speakeasy";

const router = express.Router();

// Admin Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await adminSchema.findOne({ email });

    if (existingAdmin) {
      return res.json({ message: "Admin already exists" });
    }

    const admin = new adminSchema({ email, password });
    await admin.save()

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin Login (Email + Password + OTP)
router.post("/login", async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const admin = await adminSchema.findOne({ email }).select("+password +authCode");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // OTP Auth
    if (!otp) {
      return res.status(400).json({ message: "OTP required" });
    }

    const verified = speakeasy.totp.verify({
      secret: admin.authCode,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!verified) {
      return res.status(401).json({ message: "Invalid OTP" });
    }

    res.json({ message: "Login successful" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
