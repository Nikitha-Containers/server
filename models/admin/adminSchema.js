// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";
// import cryptoJS from "crypto-js";

// const adminSchema = new mongoose.Schema(
//   {
//     adminID: { type: String, required: true },
//     email: { type: String, unique: true, required: true },
//     password: { type: String, required: true, select: false },
//     authCode: { type: String, default: "Q65YWSQJG66JPNKO" },
//     status: { type: Number, default: 1 },
//   },
//   { timestamps: true }
// );

// // Hash before save
// adminSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const shaPassword = cryptoJS.SHA256(this.password).toString();
//   this.password = await bcrypt.hash(shaPassword, 10);
//   next();
// });

// // Password compare method
// adminSchema.methods.comparePassword = async function (enteredPassword) {
//   return bcrypt.compare(enteredPassword, this.password);
// };

// export default mongoose.model("AdminDetails", adminSchema);
