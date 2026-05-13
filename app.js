import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
// import adminRoutes from "./routes/admin/adminRoutes.js";
import userRoutes from "./routes/user/userRoutes.js";
import SO_Routes from "./routes/salesOrder/SO_Routes.js";
import sapFetchRoutes from "./routes/salesOrder/sapFetchRoutes.js";
import DesignRoutes from "./routes/design/designRoutes.js";
import StoreRoutes from "./routes/stores/storeDataRoutes.js";
import MachineRoutes from "./routes/machine/machineRoutes.js";
import EmployeeRoutes from "./routes/employee/employeeRoutes.js";
import path from "path";

const { DB_CONNECTION, DATABASE, PORT, ARTWORK_PATH } = process.env;

const app = express();
const httpServer = createServer(app);

// Socket.IO — export so routes can use it
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log(" Client disconnected:", socket.id);
  });
});

// Middleware
app.use(express.json());
app.use(cors());

// Multer Config
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ArtWork Image Local Path Connection
app.use("/artworkImages", express.static(process.env.ARTWORK_PATH));

// Routes
// app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/sap", sapFetchRoutes);
app.use("/salesorder", SO_Routes);
app.use("/design", DesignRoutes);
app.use("/store", StoreRoutes);
app.use("/machine", MachineRoutes);
app.use("/employee", EmployeeRoutes);

// MongoDB Connection
mongoose
  .connect(DB_CONNECTION + DATABASE)
  .then(() => console.log("Mongo DB Connected ✔"))
  .catch((err) => console.error("Mongo DB Connection Failed ", err));

// Root endpoint
// app.get("/", async (req, res) => {
//   try {
//     res.send("Connected...! 😎😉");
//   } catch (err) {
//     console.log("Connection Was Interrupted ....! 😤", err);
//     res.status(500).send("Something went wrong!");
//   }
// });

// Use httpServer for server connection
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Running on ${PORT}`);
});

app.use(express.static(path.join(process.cwd(), "build")));

app.use((req, res) => {
  res.sendFile(path.join(process.cwd(), "build", "index.html"));
});