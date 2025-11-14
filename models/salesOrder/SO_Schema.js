import mongoose from "mongoose";

const SO_Schema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    s_no: { type: Number, required: true, unique: true },
    item_coode: { type: String, required: true },
    description: { type: String },
    item_description: { type: String },
    quantity: { type: Number, default: 0 },
    unit_price: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    hsn: { type: String },
    uom: { type: String },
    warehouse_code: { type: String },
    location_code: { type: String },
    tax_code: { type: String },
    account_code: { type: String },
    discount_percent: { type: Number, default: 0 },
    die_charges: { type: Number, default: 0 },
    freight_charges: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    art_work: { type: String },
    flim_development: { type: String },
    sales_person: { type: String },
    order_number: { type: String, unique: true },
    order_date: { type: Date },
    customer_name: { type: String },
    billing_address: { type: String },
    shipping_address: { type: String },
    contact_person: { type: String },
    contact_no: { type: String },
    po_no: { type: String },
    date: { type: Date },
    delivery_date: { type: Date },
    base_entry: { type: String },
    base_type: { type: String },
    qc_rejection: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const salesOrder = mongoose.model("salesOrder", SO_Schema);

export default salesOrder;
