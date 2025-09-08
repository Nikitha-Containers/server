import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
    {
        userID: { type: Number, unique: true },
        empID: { type: String },
        email: { type: String, unique: true, required: true },
        password: { type: String, required: true, select: false },
        empName: { type: String },
        department: { type: String },
        menu: { type: String },
        status: { type: Number, default: 1 },
    },
    { timestamps: true }
);

// Auto-increment userID

userSchema.pre("save", async function (next) {
    if (this.isNew) {
        const lastUser = await mongoose.model("user_details").findOne().sort({ userID: -1 });
        this.userID = lastUser ? lastUser.userID + 1 : 1;
    }

    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }

    next();
});

// Compare password method

userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("user_details", userSchema);
