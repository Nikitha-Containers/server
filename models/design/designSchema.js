import mongoose from "mongoose";

const designSchema = new mongoose.Schema(
  {
    saleorder_no: { type: String, required: true, unique: true },
    posting_date: { type: Date },
    machine: { type: String, default: "" },
    totalQty: { type: String, default: "" },
    components: { type: Array, default: [] },
  },
  { timestamps: true }
);

const Design = mongoose.model("upsDesign", designSchema);

export default Design;
