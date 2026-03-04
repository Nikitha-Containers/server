import mongoose from "mongoose";

const SO_Schema = new mongoose.Schema(
  {
    account_code: { type: String, default: "" },
    carton_printing: { type: String, default: "" },
    card_code: { type: String, default: "" },
    customer_name: { type: String, default: "" },
    delivery: { type: String, default: "" },

    doc_currency: { type: String },
    posting_date: { type: Date },
    due_date: { type: Date },

    saleorder_no: { type: Number, required: true },
    doc_number: { type: Number },
    doc_rate: { type: Number },

    file_ext: { type: String, default: "" },
    file_name: { type: String },

    film_develop_cost: { type: Number, default: 0 },
    freight_charges_pm: { type: Number, default: 0 },
    freight_charges_rm: { type: Number, default: 0 },

    hsn_entry: { type: Number },

    inside_coat: { type: String, default: "" },
    insurance: { type: Number, default: 0 },
    interest: { type: Number, default: 0 },

    item_code: { type: String, default: "" },
    item_description: { type: String, default: "" },
    item_line_no: { type: Number, required: true },
    item_line_total: { type: Number, default: 0 },
    thickness: { type: String, default: "" },

    customer_ref_no: { type: String, default: "" },
    outside_lid_or_bottom: { type: String, default: "" },

    other_freight: { type: Number, default: 0 },
    packing_mode: { type: String, default: "" },
    plain_or_printed: { type: String, default: "" },
    packing_and_forward: { type: Number, default: 0 },

    bill_code: { type: String, default: "" },
    item_price: { type: Number, default: 0 },
    quantity_validity: { type: String, default: "" },
    item_quantity: { type: Number, default: 0 },

    shape_of_tin: { type: String, default: "" },
    spl_instruction: { type: String, default: "" },
    sales_employee: { type: String, default: "" },
    series: { type: String, default: "" },
    ship_to_code: { type: String, default: "" },
    tolerance: { type: String, default: "" },
    typeof_material: { type: String, default: "" },

    item_tax_code: { type: String, default: "" },
    tax_date: { type: Date },

    telephone: { type: String, default: null },

    tool_and_diecost: { type: Number, default: 0 },
    total_expense: { type: Number, default: 0 },

    window: { type: String, default: "" },
    item_warehouse_code: { type: String, default: "" },

    source_path: { type: String, default: "" },
  },
  { timestamps: true },
);

SO_Schema.index({ saleorder_no: 1, item_line_no: 1 }, { unique: true });

const salesOrder = mongoose.model("salesOrder", SO_Schema);

export default salesOrder;
