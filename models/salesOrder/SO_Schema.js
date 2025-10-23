import mongoose from "mongoose";

const SO_Schema = new mongoose.Schema(
  {
    SO_Number: { type: Number, unique: true },
    SO_Date: { type: Date, default: Date.now },
    SO_Type: { type: String },
    SO_Material_Type: { type: String },
    vendorCode: { type: String },
    vendorName: { type: String },
    itemStatus: { type: String },
    itemCode: { type: String },
    description: { type: String },
    UOM: { type: String },
    SO_Quantity: { type: String },
    Rate: { type: String },
    taxRate: { type: String },
    taxCode: { type: String },
    quantityValue: { type: String },
    tax: { type: String },
    lineTotal: { type: String },
    branchName: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("SalesOrder", SO_Schema);
