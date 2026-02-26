import express from "express";
import { 
    signup, 
    login, 
    verifyEmailLink, 
    sendPasswordResetEmail,
    resendVerificationEmail, 
    verifyCode, 
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verify-email", verifyEmailLink);
router.post("/verify-code", verifyCode); 
router.post("/resend-verification-email", resendVerificationEmail); 
router.post("/send-reset-email", sendPasswordResetEmail);

export default router;