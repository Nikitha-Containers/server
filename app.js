import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import adminRoutes from "./routes/admin/adminRoutes.js";


const app = express();

// Middleware

app.use(express.json());
app.use(cors());

// Routes

app.use("/admin", adminRoutes);

// MongoDB Connection

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Mongo DB Connected ✔"))
    .catch((err) => console.error("Mongo DB Connection Failed ", err));

// Server Connection

app.listen(process.env.PORT, () => {
    console.log(`Server Running on ${process.env.PORT} `);
});
