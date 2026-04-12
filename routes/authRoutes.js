import express from "express";
import { registerUser, loginUser, getUserProfile, sendOTPForSignup, verifyOTPAndSignup, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Auth Routes
router.post("/register", registerUser);
router.post("/send-otp", sendOTPForSignup);
router.post("/verify-otp", verifyOTPAndSignup);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", protect, getUserProfile);

export default router;
