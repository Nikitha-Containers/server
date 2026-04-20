import mongoose from "mongoose";

const machineSchema = new mongoose.Schema(
  {
    machine_name: {
      type: String,
      required: true,
      trim: true,
    },

    machine_type: {
      type: String,
      required: true,
      enum: ["coating", "printing", "varnish"],
    },

    sheets_per_hour: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const MachineInfo = mongoose.model("MachineInfo", machineSchema);

export default MachineInfo;
