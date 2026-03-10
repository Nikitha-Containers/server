import mongoose from "mongoose";

const designSchema = new mongoose.Schema(
  {
    unique_id: { type: String, required: true, unique: true },
    saleorder_no: { type: Number, required: true },
    item_line_no: { type: Number, required: true },
    posting_date: { type: Date },
    item_quantity: { type: String, default: "" },
    machine: { type: String, default: "" },
    components: { type: Object, default: {} },
    art_work: { type: String, default: "" },
    item_description: { type: String, default: "" },
    customer_name: { type: String, default: "" },
    due_date: { type: Date },
    sales_employee: { type: String },
    telephone: { type: String, default: "" },
    file_name: { type: String, default: "" },
    file_ext: { type: String, default: "" },
    thickness: { type: String, default: "" },

    // Design
    design_pending_details: { type: Object, default: {} },
    design_status: { type: Number },

    // Printing Manager
    printingmanager_pending_details: { type: Object, default: {} },
    printingmanager_status: { type: Number },

    // Planning
    planning_work_details: { type: Object, default: {} },
    planning_pending_details: { type: Object, default: {} },
    planning_status: { type: Number },

    // Coating
    coating_operator_name: { type: String, default: "" },
    coating_pending_details: { type: Object, default: {} },
    coating_status: { type: Number },

    // Printing Team
    printingteam_operator_name: { type: String, default: "" },
    printingteam_pending_details: { type: Object, default: {} },
    printingteam_status: { type: Number },
  },

  { timestamps: true },
);

designSchema.index({ unique_id: 1 }, { unique: true });

const Design = mongoose.model("upsDesign", designSchema);

export default Design;
