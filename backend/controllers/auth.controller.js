import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Assuming sendEmail is a separate utility for generic emails like password reset
import { sendVerificationLink, sendEmail } from "../utils/email.utils.js";
import validator from "validator";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
// Note: process.env.MONGO_URI line serves no purpose outside of env config, but is harmless.
process.env.MONGO_URI 
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?\d{10,15}$/;
const isValidPassword = (password) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(password);
const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Helper to log audit events on user document for later evidence
 */
async function pushAudit(user, action, req, extra = {}) {
    try {
        // Correctly extracts IP address from standard headers/connection
        const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const ua = req.headers["user-agent"] || "";
        const entry = {
            action,
            ip,
            userAgent: ua,
            timestamp: new Date(),
            ...extra,
        };
        user.verificationAudit = user.verificationAudit || [];
        user.verificationAudit.push(entry);
        // Keeps audit log size limited to 50 entries
        if (user.verificationAudit.length > 50) user.verificationAudit.shift();
        await user.save();
    } catch (err) {
        console.error("Audit log error:", err.message);
    }
}

/**
 * SIGNUP: Creates a new user and initiates email or phone verification.
 */
export const signup = async (req, res) => {
    try {
        const { name, email, phone, password, role, visionStatement } = req.body;

        // --- Validation Checks ---
        if (!name || !password || !role || (!email && !phone)) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        if (!["student", "tutor"].includes(role)) {
            return res.status(400).json({ success: false, message: "Invalid role" });
        }

        if (email && !emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email" });
        }

        if (phone && !phoneRegex.test(phone)) {
            return res.status(400).json({ success: false, message: "Invalid phone number" });
        }

        if (!isValidPassword(password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters and include letters and numbers",
            });
        }

        if (role === "student" && (!visionStatement || visionStatement.length < 50)) {
            return res.status(400).json({
                success: false,
                message: "Vision statement must be at least 50 characters",
            });
        }

        // --- Duplicate Checks ---
        if (email && await User.findOne({ email })) {
            return res.status(400).json({ success: false, message: "Email already in use" });
        }
        if (phone && await User.findOne({ phone })) {
            return res.status(400).json({ success: false, message: "Phone already in use" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const userPayload = {
            name,
            email,
            phone,
            passwordHash,
            role,
            visionStatement: role === "student" ? visionStatement : undefined,
            emailVerification: { verified: false },
            phoneVerification: { verified: false },
            canUploadDocuments: false,
            resendCount: 0,
            lastResendAt: null,
            verificationAudit: [],
        };

        if (!email && phone) {
            // Set phone verification code and expiry if no email is provided
            userPayload.phoneVerification.code = generateVerificationCode();
            userPayload.phoneVerification.expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
        }

        const newUser = await User.create(userPayload);
        await pushAudit(newUser, "signup", req, { note: "user created (unverified)" });

        if (email) {
            // Send email verification link
            const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "10m" });
            const sent = await sendVerificationLink(email, name, token);

            if (sent) {
                await pushAudit(newUser, "verification-email-sent", req);
            } else {
                await pushAudit(newUser, "verification-email-failed", req);
                // Allow account creation even if email fails, but inform the user
                return res.status(201).json({
                    success: true,
                    message: "Account created but failed to send verification email. Please request a resend.",
                    data: { id: newUser._id, email, phone, role: newUser.role },
                });
            }
        } else {
            // Log code for development/testing when phone is used without email
            console.log("Phone verification code (dev):", newUser.phoneVerification.code);
            await pushAudit(newUser, "phone-verification-code-created", req);
        }

        return res.status(201).json({
            success: true,
            message: email ? "Signup successful. Please verify your email." : "Signup successful. Please verify your phone number using the code.",
            data: { id: newUser._id, email, phone, role: newUser.role },
        });
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * VERIFY EMAIL LINK (GET): Handles the verification link click from email.
 */
export const verifyEmailLink = async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) return res.redirect(`${FRONTEND_URL}/verify-failed`);

        let payload;
        try {
            payload = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            console.error("Token verification error:", err.message);
            return res.redirect(`${FRONTEND_URL}/verify-failed`);
        }

        const user = await User.findById(payload.id);
        if (!user) return res.redirect(`${FRONTEND_URL}/verify-failed`);

        if (!user.emailVerification.verified) {
            user.emailVerification.verified = true;
            // Clear verification fields once verified
            user.emailVerification.code = undefined;
            user.emailVerification.expiresAt = undefined;
            // Set flag for document upload capability
            user.canUploadDocuments = true;
            user.resendCount = 0;
            user.lastResendAt = null;

            await user.save();
            await pushAudit(user, "email-verification-success", req);
        } else {
            await pushAudit(user, "email-verification-already", req);
        }

        return res.redirect(`${FRONTEND_URL}/login?verified=success`);
    } catch (error) {
        console.error("verifyEmailLink error:", error);
        return res.redirect(`${FRONTEND_URL}/verify-failed`);
    }
};

/**
 * RESEND VERIFICATION EMAIL: Sends a new email verification link, with rate limiting.
 */
export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Valid email required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        if (user.emailVerification.verified) {
            return res.status(400).json({ success: false, message: "Already verified" });
        }

        const now = Date.now();
        const COOLDOWN_MS = 60 * 1000; // 1 minute cooldown
        const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
        const MAX_RESENDS_PER_WINDOW = 3;

        user.resendCount = user.resendCount || 0;
        user.lastResendAt = user.lastResendAt || null;

        // Reset resend count if the window has passed
        if (user.lastResendAt && (now - new Date(user.lastResendAt).getTime()) > WINDOW_MS) {
            user.resendCount = 0;
            user.lastResendAt = null;
        }

        if (user.lastResendAt && (now - new Date(user.lastResendAt).getTime()) < COOLDOWN_MS) {
            return res.status(429).json({ success: false, message: "Please wait before requesting again (1 minute cooldown)" });
        }

        if (user.resendCount >= MAX_RESENDS_PER_WINDOW) {
            return res.status(429).json({ success: false, message: "Maximum resend attempts reached for this hour. Try later." });
        }

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "10m" });
        const sent = await sendVerificationLink(user.email, user.name, token);

        user.resendCount += 1;
        user.lastResendAt = new Date();
        await user.save();

        if (sent) {
            await pushAudit(user, "verification-email-resent", req);
            return res.status(200).json({ success: true, message: "Verification email resent" });
        } else {
            await pushAudit(user, "verification-email-resend-failed", req);
            // This is critical: if it failed to send, the count is still incremented, preventing abuse.
            return res.status(500).json({ success: false, message: "Failed to resend verification email" });
        }
    } catch (error) {
        console.error("resendVerificationEmail error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * VERIFY PHONE CODE: Verifies the code sent to the user's phone number.
 */
export const verifyCode = async (req, res) => {
    try {
        const { userId, code } = req.body;
        if (!userId || !code)
            return res.status(400).json({ success: false, message: "User ID and code required" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (user.phoneVerification.verified)
            return res.status(400).json({ success: false, message: "Already verified" });

        // Check if code matches AND if it is still within the expiry time
        const isCodeValid =
            user.phoneVerification.code === code.toString() &&
            user.phoneVerification.expiresAt > new Date();

        if (!isCodeValid) {
            await pushAudit(user, "phone-verification-failed", req, { providedCode: code });
            return res.status(400).json({ success: false, message: "Invalid or expired code" });
        }

        user.phoneVerification.verified = true;
        user.phoneVerification.code = undefined;
        user.phoneVerification.expiresAt = undefined;
        user.canUploadDocuments = true; // Set flag after verification
        await user.save();
        await pushAudit(user, "phone-verification-success", req);

        return res.status(200).json({ success: true, message: "Phone verified successfully" });
    } catch (error) {
        console.error("verifyCode error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * LOGIN: Authenticates user by email/phone and password.
 */
export const login = async (req, res) => {
    try {
        const { emailOrPhone, password } = req.body;
        if (!emailOrPhone || !password)
            return res.status(400).json({ success: false, message: "Email/Phone and password required" });

        // Allows login using either email or phone
        const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
        if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

        // Enforce verification before login
        if (!user.emailVerification.verified && !user.phoneVerification.verified) {
            return res.status(403).json({ success: false, message: "Please verify your account first" });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                visionStatement: user.visionStatement,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * SEND PASSWORD RESET EMAIL: Initiates the password reset process.
 */
export const sendPasswordResetEmail = async (req, res) => {
    const { email } = req.body;
    try {
        // Find user
        const user = await User.findOne({ email });
        // Return 200 even if user isn't found to prevent enumeration attacks
        if (!user) return res.status(200).json({ success: true, message: "If an account exists, a reset email has been sent." });

        // Generate cryptographically secure token
        const token = crypto.randomBytes(20).toString("hex");
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000; // 1 hour expiry
        await user.save();

        // Send reset link (using the imported sendEmail utility)
        const resetLink = `${FRONTEND_URL}/reset-password/${token}`;
        // NOTE: The function name sendEmail must be available in ../utils/email.utils.js
        await sendEmail(user.email, "Password Reset Request", `Reset your password here: ${resetLink}`);
        await pushAudit(user, "password-reset-link-sent", req);

        res.status(200).json({
            success: true,
            message: "If an account exists, a password reset email has been sent.",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error sending reset email" });
    }
}