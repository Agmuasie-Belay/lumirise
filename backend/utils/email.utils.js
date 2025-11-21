// utils/email.utils.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const {
  GMAIL_USER, // Your Gmail email address
  GMAIL_APP_PASS, // Gmail App Password (required if 2FA enabled)
  BACKEND_URL = "http://localhost:5000",
} = process.env;

/**
 * Verification email HTML (template unchanged)
 */
export const verificationTemplate = (name, token) => {
  const verifyUrl = `${BACKEND_URL}/api/auth/verify-email?token=${token}`;
  return `
    <div style="font-family: Arial, sans-serif; color: #222;">
      <h2>Welcome to LumiRise, ${name}!</h2>
      <p>Click the button below to verify your email and activate your account.</p>
      <a href="${verifyUrl}" style="display:inline-block; padding:10px 18px; background:#007BFF; color:#fff; text-decoration:none; border-radius:6px;">Verify Email</a>
      <p style="margin-top:12px; color:#666; font-size:13px;">
        This link will expire in 10 minutes. If the button doesn't work, copy and paste this URL into your browser:
      </p>
      <p style="font-size:12px; color:#007BFF;">${verifyUrl}</p>
      <hr/>
      <p style="color:#666; font-size:13px;">If you didn't create an account, ignore this email.</p>
      <p style="color:#666; font-size:13px;">— LumiRise Support Team</p>
    </div>
  `;
};

/**
 * Nodemailer transporter for Gmail SMTP
 */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // SSL
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASS,
  },
});

/**
 * Send email with retry attempts
 */
export const sendEmail = async (to, subject, html) => {
  const MAX_ATTEMPTS = 3;
  let attempt = 0;

  while (attempt < MAX_ATTEMPTS) {
    try {
      await transporter.sendMail({
        from: `"LumiRise Team" <${GMAIL_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`✅ Email sent to ${to}`);
      return true;
    } catch (err) {
      attempt++;
      console.error(`❌ sendEmail attempt ${attempt} failed for ${to}:`, err.message);
      if (attempt >= MAX_ATTEMPTS) return false;
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
};

/**
 * Send verification link (wrapper)
 */
export const sendVerificationLink = async (email, name, token) => {
  const subject = "Verify your LumiRise account";
  const html = verificationTemplate(name || "User", token);
  return await sendEmail(email, subject, html);
};
