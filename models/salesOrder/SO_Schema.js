import mongoose from "mongoose";

const SO_Schema = new mongoose.Schema(
  {
    unique_id: { type: Number, required: true, unique: true },
    invoice_no: { type: String, required: true, unique: true },
    saleorder_no: { type: String ,required: true, unique: true},
    customer_name: { type: String },
    discount_percent: { type: Number, default: 0 },
    posting_date: { type: Date },
    due_date: { type: Date },
    document_type: { type: String },
    group_no: { type: Number },
    account_code: { type: String },
    item_discount_percent: { type: Number },
    item_code: { type: String },
    item_description: { type: String },
    location: { type: Number },
    unit_price: { type: Number, default: 0 },
    quantity: { type: Number },
    tax_code: { type: String },
    base_entry: { type: Number },
    base_type: { type: String },
    warehouse_code: { type: String },
    customer_ref_no: { type: String },
    bill_code: { type: String },
    round_off: { type: String },
    round_diff_amount: { type: Number },
    sales_person: { type: Number },
    document_series: { type: String },
    shipping_code: { type: String },
    tax_date: { type: Date },
    art_work: { type: String },
    flim_development: { type: String },
    posting_status: { type: String },
    document_no: { type: Number },
    transportation: { type: String },
    thickness: { type: String },
  },
  { timestamps: true }
);

SO_Schema.pre("save", async function (next) {
  try {
    if (this.isNew && !this.unique_id) {
      const lastDoc = await mongoose
        .model("salesOrder")
        .findOne()
        .sort({ unique_id: -1 })
        .lean();

      this.unique_id = lastDoc ? lastDoc.unique_id + 1 : 1;
    }

    next();
  } catch (err) {
    next(err);
  }
});

const salesOrder =
  mongoose.models.salesOrder || mongoose.model("salesOrder", SO_Schema);

export default salesOrder;
