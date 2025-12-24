import mongoose from "mongoose";

const SO_Schema = new mongoose.Schema(
  {
    invoice_no: { type: String },
    saleorder_no: { type: String },
    customer_name: { type: String },
    comments: { type: String },
    discount_percent: { type: Number },
    posting_date: { type: Date },
    due_date: { type: Date },
    document_type: { type: String },
    group_no: { type: Number },

    //Item Details Strat Here
    account_code: { type: String },
    item_discount_percent: { type: Number },
    item_code: { type: String },
    item_description: { type: String },
    item_line_no: { type: Number },
    item_location_code: { type: Number },
    item_price: { type: Number },
    item_quantity: { type: Number },
    item_tax_code: { type: String },
    item_u_baseentry: { type: Number },
    item_u_base_type: { type: String },
    item_warehouse_code: { type: String },
    //Item Details End Here

    customer_ref_no: { type: String },
    bill_code: { type: String },
    round_off: { type: String },
    round_diff_amount: { type: Number },
    sales_person_code: { type: Number },
    document_series: { type: String },
    shipto_code: { type: String },
    tax_date: { type: Date },
    u_baseentry: { type: Number },
    u_basetype: { type: String },
    u_posted: { type: String },
    u_ssodentry: { type: Number },
    u_ssodoc: { type: Number },

    art_work: { type: String }, //missing and artwork image need
    thickness: { type: String }, //thickness is missing
  },
  { timestamps: true }
);

const salesOrder = mongoose.model("salesOrder", SO_Schema);

export default salesOrder;
