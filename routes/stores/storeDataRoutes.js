import express from "express";
import storeData from "../../models/stores/storeDataExcel.js";

const router = express.Router();

// Post a Excel Sheet to DB

router.post("/save", async (req, res) => {
  try {
    const { rows } = req.body;

    const docNos = rows.map((r) => r.doc_no);

    const exists = await storeData.findOne({
      doc_no: { $in: docNos },
    });

    if (exists) {
      return res.status(400).json({ message: "Duplicate data" });
    }

    await storeData.insertMany(rows);

    res.status(200).json({ message: "Saved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error" });
  }
});

// Get a Data

router.get("/data", async (req, res) => {
  try {
    const data = await storeData.find();
    res
      .status(200)
      .json({ success: true, message: "Data get successfully", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
