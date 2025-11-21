import express from "express";
import {
  signup,
  login,
  verifyEmailLink, // Handles GET request for the clickable link
  resendVerificationEmail, // Allows users to request a new code/link
  verifyPhoneCode, // Handles POST request for phone SMS code verification
  sendPasswordResetEmail, // Initiates the password reset process
  getProfile,
  updateProfile
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// --- Public Authentication & Verification Routes ---

// Registration
router.post("/signup", signup);
// Login (using email or phone)
router.post("/login", login);

// Account Verification
// 1. Verification via a clickable link (GET request)
router.get("/verify-email", verifyEmailLink);
// 2. Verification via a submitted code (POST request, usually for phone/SMS)
router.post("/verify-phone", verifyPhoneCode);
// 3. Resend verification for lost/expired codes/links
router.post("/resend-verification", resendVerificationEmail);

// Password Management
// 1. Send password reset link to user's email
router.post("/send-reset-email", sendPasswordResetEmail);
// NOTE: The actual 'resetPassword' endpoint would typically be added here,
// accepting the token and new password (not included in the controller from the prompt).

// --- Protected Routes (Requires Authentication Middleware) ---

// View and Update Profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;