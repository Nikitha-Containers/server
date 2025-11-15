import mongoose from "mongoose";

const SO_Schema = new mongoose.Schema(
  {
    // unique_id: { type: Number, required: true, unique: true },
    invoice_no: { type: Number, required: true, unique: true },
    saleorder_no: { type: String },
    customer_name: { type: String },
    item_code: { type: String },
    item_description: { type: String },
    quantity: { type: Number },
    unit_price: { type: Number, default: 0 },
    warehouse_code: { type: String },
    location_code: { type: Number },
    tax_code: { type: String },
    account_code: { type: String },
    discount_percent: { type: Number, default: 0 },
    art_work: { type: String },
    flim_development: { type: String },
    sales_person: { type: String },
    order_date: { type: Date },
    delivery_date: { type: Date },
    base_entry: { type: Number },
    base_type: { type: String },
  },
  { timestamps: true }
);

const salesOrder = mongoose.model("salesOrder", SO_Schema);
export default salesOrder;
