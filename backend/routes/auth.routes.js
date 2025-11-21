import express from "express";
import { 
    signup, 
    login, 
    verifyEmailLink, 
    sendPasswordResetEmail,
    resendVerificationEmail, // Added import
    verifyCode, // Added import
} from "../controllers/auth.controller.js";

const router = express.Router();

// Public Authentication Routes
router.post("/signup", signup);
router.post("/login", login);

// Email Verification (Triggered by link click)
router.get("/verify-email", verifyEmailLink);

// Phone Code Verification (Used for phone-only signup)
router.post("/verify-code", verifyCode); // NEW ROUTE

// Resend Email Verification (Includes rate limiting logic)
router.post("/resend-verification-email", resendVerificationEmail); // NEW ROUTE

// Password Reset Initiation
router.post("/send-reset-email", sendPasswordResetEmail);


export default router;