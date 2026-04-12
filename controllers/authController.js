// controllers/authController.js (ES6 module version)

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateOTP, getOTPExpiry, isOTPExpired } from "../utils/otp.js";
import { sendOTPEmail, sendPasswordResetEmail, sendSuspiciousLoginEmail } from "../utils/emailService.js";
import { checkLoginRateLimit, recordFailedAttempt, clearLoginAttempts, getRemainingAttempts } from "../middlewares/loginRateLimiter.js";

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

/**
 * Request OTP for email verification during signup
 */
export const sendOTPForSignup = async (req, res) => {
    try {
        const { email, name, password } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address (e.g., user@gmail.com)" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User with this email already exists. Please log in." });
        }

        // Validate password
        if (password.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters." });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        // Hash password for later use
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Store temporary signup data with OTP
        const tempUser = await User.create({
            name,
            email,
            password: hashedPassword,
            emailVerificationOTP: otp,
            otpExpiry,
            isEmailVerified: false,
        });

        // Send OTP via email
        const emailResult = await sendOTPEmail(email, otp);
        if (!emailResult.success) {
            await User.deleteOne({ _id: tempUser._id });
            return res.status(500).json({ message: "Failed to send OTP. Please try again." });
        }

        res.status(200).json({ 
            message: "OTP sent to your email. Verify within 5 minutes.",
            userId: tempUser._id,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Verify OTP and complete signup
 */
export const verifyOTPAndSignup = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found. Please sign up again." });
        }

        // Check if email already verified
        if (user.isEmailVerified) {
            return res.status(400).json({ message: "Email already verified. Please log in." });
        }

        // Validate OTP
        if (!user.emailVerificationOTP || user.emailVerificationOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // Check if OTP expired
        if (isOTPExpired(user.otpExpiry)) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Mark email as verified and clear OTP
        user.isEmailVerified = true;
        user.emailVerificationOTP = null;
        user.otpExpiry = null;
        await user.save();

        // Generate token
        const token = generateToken(user._id);

        res.json({
            message: "Email verified successfully!",
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Register user (legacy - now uses OTP approach)
 */
export const registerUser = async (req, res) => {
    // Redirect to sendOTPForSignup
    return sendOTPForSignup(req, res);
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check rate limiting first
        const rateLimitStatus = checkLoginRateLimit(email);
        if (rateLimitStatus.isLocked) {
            return res.status(429).json({ 
                message: rateLimitStatus.message,
                retryAfter: rateLimitStatus.remainingTime,
                locked: true,
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                message: `No user found with email "${email}". Would you like to create an account?`,
                userNotFound: true,
                email,
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({ 
                message: "Please verify your email first. Check your inbox for the OTP.",
                emailNotVerified: true,
            });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            // Record failed attempt
            const failedAttemptRecord = recordFailedAttempt(email);
            
            if (failedAttemptRecord.shouldLock) {
                // Send security alert email
                await sendSuspiciousLoginEmail(email, user.name);
                
                console.log(`🔒 Account ${email} locked after 5 failed attempts`);
                return res.status(429).json({ 
                    message: "Too many failed login attempts. Your account has been locked for 15 minutes for security. Check your email for more details.",
                    locked: true,
                    retryAfter: 900, // 15 minutes in seconds
                });
            }

            const remaining = getRemainingAttempts(email);
            return res.status(400).json({ 
                message: `Incorrect password. Please try again. (${remaining} attempts remaining)`,
                attemptsRemaining: remaining,
            });
        }

        // Login successful - clear failed attempts
        clearLoginAttempts(email);

        // Return user data with JWT
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Request OTP for password reset
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                message: `No account found with email "${email}"`,
                userNotFound: true,
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = getOTPExpiry();

        // Store OTP in database
        user.passwordResetOTP = otp;
        user.passwordResetOTPExpiry = otpExpiry;
        await user.save();

        // Send OTP via email
        const emailResult = await sendPasswordResetEmail(email, otp);
        if (!emailResult.success) {
            return res.status(500).json({ message: "Failed to send reset OTP. Please try again." });
        }

        res.status(200).json({ 
            message: "Password reset OTP sent to your email. Verify within 5 minutes.",
            email,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

/**
 * Verify OTP and reset password
 */
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        // Validate password
        if (!newPassword || newPassword.length < 8) {
            return res.status(400).json({ message: "Password must be at least 8 characters" });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Validate OTP
        if (!user.passwordResetOTP || user.passwordResetOTP !== otp) {
            return res.status(400).json({ message: "Invalid OTP. Please try again." });
        }

        // Check if OTP expired
        if (isOTPExpired(user.passwordResetOTPExpiry)) {
            return res.status(400).json({ message: "OTP has expired. Please request a new one." });
        }

        // Verify email if not already verified
        if (!user.isEmailVerified) {
            user.isEmailVerified = true;
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP
        user.password = hashedPassword;
        user.passwordResetOTP = null;
        user.passwordResetOTPExpiry = null;
        await user.save();

        res.json({ 
            message: "Password reset successfully! You can now log in with your new password.",
            email,
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
