import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    emp_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    emp_type: {
      type: String,
      required: true,
      enum: ["instructor", "operator"],
    },
    machine_type: {
      type: String,
      required: true,
      enum: ["coating", "printing", "varnish"],
    },
  },
  {
    timestamps: true,
  }
);

const EmployeeInfo = mongoose.model("EmployeeInfo", employeeSchema);
export default EmployeeInfo;