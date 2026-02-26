import express from "express";
import {
  signup,
  login,
  verifyEmailLink,
  resendVerificationEmail,
  verifyPhoneCode,
  sendPasswordResetEmail,
  getProfile,
  updateProfile,
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public Authentication & Verification Routes
router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmailLink);
router.post("/verify-phone", verifyPhoneCode);
router.post("/resend-verification", resendVerificationEmail);
router.post("/send-reset-email", sendPasswordResetEmail);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
