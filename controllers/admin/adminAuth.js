import dotenv from "dotenv";
dotenv.config();
import Admin from "../../models/admin/adminSchema.js";
import jwt from "jsonwebtoken";
import express from "express";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;



const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Admin Register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const admin = await Admin.create({ email, password });

    const token = generateToken(admin._id);

    res.status(201).json({
      token,
      admin: { id: admin._id, email: admin.email },
      message: "Admin created successfully",
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(admin._id);

    res.json({
      token,
      message: "Login successful",
      admin: { id: admin._id, email: admin.email },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
