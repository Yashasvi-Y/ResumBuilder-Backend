// models/User.js (ES6 module version)

import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isEmailVerified: { type: Boolean, default: false },
        emailVerificationOTP: { type: String, default: null },
        otpExpiry: { type: Date, default: null },
        passwordResetOTP: { type: String, default: null },
        passwordResetOTPExpiry: { type: Date, default: null },
    },
    { timestamps: true }
);

export default mongoose.model("User", UserSchema);
