import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";

const userSchema = new mongoose.Schema(
  {
    userID: { type: Number, unique: true },
    empID: { type: String },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    empName: { type: String },
    department: { type: String },
    ipAddress: { type: String },
    loginType: { type: String, enum: ["Admin", "User"], default: "User" },
    status: { type: Number, default: 1 },
    sidemenus: { type: String, default: "" },
    authCode: { type: String, select: false, default: null }, // Only for admin
  },
  { timestamps: true }
);

// Auto-increment userID + password hash + ADMIN OTP
userSchema.pre("save", async function (next) {
  // Auto increment
  if (this.isNew) {
    const lastUser = await mongoose
      .model("UserDetails")
      .findOne()
      .sort({ userID: -1 });

    this.userID = lastUser ? lastUser.userID + 1 : 1;
  }

  //  Generate OTP secret ONLY for Admin
  if (this.isNew && this.loginType === "Admin") {
    const secret = speakeasy.generateSecret({ length: 20 });
    this.authCode = secret.base32;
  }

  //  Hash password
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("UserDetails", userSchema);
