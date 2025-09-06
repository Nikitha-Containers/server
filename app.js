import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import adminRouter from './controllers/admin/adminAuth.js'

const app = express();
const router = express.Router();
app.use(express.json());
app.use(cors());

// Middleware
app.use("/admin", adminRouter);

// MongoDB Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("Mongo DB Connected ✔"))
    .catch((err) => console.error("Mongo DB Connection Failed ", err));

// Server Connection

router.get("/", async (req, res) => {
    try {
        res.send("Connected...! 😎😉");
    } catch (err) {
        console.log("Connection Was Interrupted ....! 😤", err);
        res.status(500).send("Something went wrong!");
    }
});


app.listen(process.env.PORT, () => {
    console.log(`Server Running on ${process.env.PORT} `);
});
