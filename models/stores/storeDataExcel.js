import mongoose from "mongoose";

const storeDataExcel = new mongoose.Schema(
  {
    doc_no: { type: Number, unique: true, required: true },
    doc_date: { type: Date },
    size: { type: String },
    location: { type: String },
    quantity: { type: Number },
    price: { type: Number },
    total_value: { type: Number },
  },
  { timestamps: true }
);

const storeData = mongoose.model("storeData", storeDataExcel);

export default storeData;
