import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import adminRoutes from "./routes/Admin/adminRoutes.js";
import userRoutes from "./routes/User/userRoutes.js";

const { DB_CONNECTION, DATABASE, PORT } = process.env;

const app = express();
const router = express.Router();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
// app.use("/sales", SO_Routes);

app.use("/", router);

// MongoDB Connection
mongoose
  .connect(DB_CONNECTION + DATABASE)
  .then(() => console.log("Mongo DB Connected ✔"))
  .catch((err) => console.error("Mongo DB Connection Failed ", err));

// Root endpoint
router.get("/", async (req, res) => {
  try {
    res.send("Connected...! 😎😉");
  } catch (err) {
    console.log("Connection Was Interrupted ....! 😤", err);
    res.status(500).send("Something went wrong!");
  }
});

// Server Connection
app.listen(PORT, () => {
  console.log(`Server Running on ${PORT}`);
});
