import express from "express";
import bcrypt from "bcryptjs";
import userSchema from "../../models/users/userSchema.js";

const router = express.Router();

// Register User
router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await userSchema.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const user = await userSchema.create({ email, password });

        res.status(201).json({
            user: { id: user._id, userID: user.userID, email: user.email },
            message: "User created successfully",
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
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

        res.status(200).json({
            message: "Login successful",
            user: { id: user._id, userID: user.userID, email: user.email },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Users
router.get("/allusers", async (req, res) => {
    try {
        const usersList = await userSchema.find();
        if (!usersList.length) {
            return res.status(404).json({ message: "No users found" });
        }
        res.status(200).json({ usersList });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a Single User
router.get("/:userID", async (req, res) => {
    try {
        const singleUser = await userSchema.findOne({ userID: req.params.userID });
        if (!singleUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ singleUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update User (with explicit password hashing)
router.put("/:userID", async (req, res) => {
    try {
        const updateData = { ...req.body };

        // if password included, hash it before saving
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

        res.status(200).json({
            message: "User Updated Successfully",
            updateUser,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete User
router.delete("/:userID", async (req, res) => {
    try {
        const deleteUser = await userSchema.findOneAndDelete({ userID: req.params.userID });
        if (!deleteUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully", deleteUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
