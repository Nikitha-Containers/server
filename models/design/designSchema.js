import mongoose from "mongoose";

const designSchema = new mongoose.Schema(
  {
    saleorder_no: { type: String, required: true, unique: true },
    posting_date: { type: Date },
    machine: { type: String, default: "" },
    totalQty: { type: String, default: "" },
    components: { type: Object, default: {} },
    art_work: { type: String, default: "" },
    size: { type: String, default: "" },
    customer_name: { type: String, default: "" },
    start_date: { type: Date },
    end_date: { type: Date },
  },
  { timestamps: true }
);

const Design = mongoose.model("upsDesign", designSchema);

export default Design;