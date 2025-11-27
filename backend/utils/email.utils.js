import nodemailer from "nodemailer";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const { GMAIL_USER, GMAIL_APP_PASS, BACKEND_URL, JWT_SECRET } = process.env;

// -------------------------
// Email Verification Template
// -------------------------
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

// -------------------------
// Nodemailer Transporter
// -------------------------
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASS,
  },
});

// -------------------------
// Low-level send function
// -------------------------
const sendEmailOnce = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"LumiRise" <${GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (err) {
    console.error("sendEmail error:", err.message);
    return false;
  }
};

// -------------------------
// High-level send with retry + fallback
// -------------------------
export const sendVerificationLink = async (email, name, userId) => {
  const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "10m" });
  const subject = "Verify your LumiRise account";
  const html = verificationTemplate(name || "User", token);

  let sent = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 1;

  while (!sent && attempts < MAX_ATTEMPTS) {
    attempts++;
    console.log(`Attempt ${attempts} to send verification email to ${email}`);
    sent = await sendEmailOnce(email, subject, html);
  }

  if (sent) return { sent: true, fallbackVerificationLink: null };

  // All attempts failed → provide fallback link
  const fallbackVerificationLink = `${BACKEND_URL}/api/auth/verify-email?token=${token}`;
  console.warn(`Email failed after ${MAX_ATTEMPTS} attempts. Fallback link: ${fallbackVerificationLink}`);
  return { sent: false, fallbackVerificationLink };
};

// -------------------------
// Generic email function
// -------------------------
export const sendEmail = async (to, subject, html) => {
  return await sendEmailOnce(to, subject, html);
};
