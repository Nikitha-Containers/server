// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import speakeasy from "speakeasy";
// import jwt from "jsonwebtoken";
// import adminSchema from "../../models/admin/adminSchema.js";

// const router = express.Router();

// // Genarate JWT token

// const generateToken = (admin) => {
//   return jwt.sign(
//     { adminID: admin.adminID, email: admin.email },
//     process.env.JWT_SECRET,
//     { expiresIn: process.env.EXPIRES_IN }
//   );
// };

// // Admin Register
// router.post("/register", async (req, res) => {
//   try {
//     const { adminID, email, password } = req.body;

//     const existingAdmin = await adminSchema.findOne({ email });
//     if (existingAdmin) {
//       return res.json({ message: "Admin already exists" });
//     }

//     const admin = new adminSchema({ adminID, email, password });
//     await admin.save();

//     res.status(201).json({
//       success: true,
//       message: "Admin created successfully",
//       admin,
//     });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// });

// // Admin Login (Email + Password)
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await adminSchema.findOne({ email }).select("+password");

//     if (!admin || !(await admin.comparePassword(password))) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }
//     res.json({
//       success: true,
//       message: "Password correct, proceed to OTP verification",
//       adminID: admin.adminID,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // OTP Verification + JWT Issue
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { adminID, otp } = req.body;
//     const admin = await adminSchema.findOne({ adminID }).select("+authCode");

//     if (!admin) return res.status(404).json({ message: "Admin not found" });

//     const verifyOTP = speakeasy.totp.verify({
//       secret: admin.authCode,
//       encoding: "base32",
//       token: otp,
//       window: 1,
//     });

//     if (!verifyOTP) {
//       return res
//         .status(401)
//         .json({ message: "Invalid OTP. Please try again !" });
//     }

//     const token = generateToken(admin);

//     res.json({ success: true, message: "Login successful with OTP", token });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// export default router;
