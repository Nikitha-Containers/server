import mongoose from "mongoose";

const designSchema = new mongoose.Schema(
  {
    saleorder_no: { type: String, required: true, unique: true },
    posting_date: { type: Date },
    item_quantity: { type: String, default: "" },
    machine: { type: String, default: "" },
    components: { type: Object, default: {} },
    art_work: { type: String, default: "" },
    item_description: { type: String, default: "" },
    customer_name: { type: String, default: "" },
    due_date: { type: Date },
    design_status: { type: Number, default: 1 },
    design_pending_details: { type: Object, default: {} },
    sales_person_code: { type: String, default: "" },
  },
  { timestamps: true }
);

const Design = mongoose.model("upsDesign", designSchema);

export default Design;
