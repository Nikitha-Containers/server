import mongoose from "mongoose";

const designSchema = new mongoose.Schema(
  {
    saleorder_no: { type: String, default: "" },
    posting_date: { type: Date, default: "" },
    fab_site: { type: String, default: "" },
    job_name: { type: String, default: "" },
    components: { type: Array, default: [] },
  },
  { timestamps: true }
);

const Design = mongoose.model("upsDesign", designSchema);

export default Design;
