import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationLink } from "../utils/email.utils.js"; 

// Regex 
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?\d{10,15}$/;

// Utility to generate JWT for password reset
const generateResetToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "10m" }); 
};

// SIGNUP 
export const signup = async (req, res) => {
  const { name, email, phone, password, role, visionStatement, documents } = req.body;

  if (!name || !password || !role) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  if (role === "student" && !email && !phone) {
    return res.status(400).json({ success: false, message: "Student must provide email or phone" });
  }

  if (email && !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "Invalid email format" });
  }

  if (phone && !phoneRegex.test(phone)) {
    return res.status(400).json({ success: false, message: "Invalid phone format" });
  }

  if (role === "student" && visionStatement && visionStatement.length < 20) {
    return res.status(400).json({ success: false, message: "Vision statement too short" });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationCode = Math.floor(100000 + Math.random() * 900000); // 6-digit code
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour expiry

    const newUser = new User({
      name,
      email,
      phone,
      role,
      passwordHash: hashedPassword,
      visionStatement: visionStatement || "",
      emailVerification: email ? { code: verificationCode, verified: false, expiresAt } : undefined,
      phoneVerification: phone ? { code: verificationCode, verified: false, expiresAt } : undefined,
      studentDocuments: role === "student" && documents ? { ...documents } : undefined,
      tutorDocuments: role === "tutor" && documents ? { ...documents } : undefined,
    });

    await newUser.save();

    // Send verification
    if (email) await sendVerificationLink(email, verificationCode, "email", newUser._id); 
    else if (phone) await sendVerificationLink(phone, verificationCode, "sms", newUser._id);

    res.status(201).json({
      success: true,
      message: "Signup successful. Verification code sent.",
      data: { id: newUser._id, email, phone, role },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// VERIFY EMAIL (Link/GET Request) 
export const verifyEmailLink = async (req, res) => {
  const { id: userId, code } = req.query; 

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const verification = user.emailVerification;

    if (!verification || verification.verified) {
      return res.status(400).json({ success: false, message: "Email already verified or verification not set up." });
    }

    if (verification.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Verification link has expired. Please request a new one." });
    }

    if (verification.code.toString() !== code.toString()) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    user.emailVerification.verified = true;
    user.emailVerification.code = null;
    user.emailVerification.expiresAt = null;

    await user.save();
    res.status(200).json({ success: true, message: "Email verified successfully." }); 
  } catch (error) {
    console.error("Email verification error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// VERIFY PHONE 
export const verifyPhoneCode = async (req, res) => {
  const { userId, code } = req.body; 

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const verification = user.phoneVerification;

    if (!verification || verification.verified) {
      return res.status(400).json({ success: false, message: "Phone already verified or verification not set up." });
    }
    
    if (verification.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: "Verification code has expired. Please request a new one." });
    }

    if (verification.code.toString() !== code.toString()) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    user.phoneVerification.verified = true;
    user.phoneVerification.code = null;
    user.phoneVerification.expiresAt = null;

    await user.save();

    res.status(200).json({ success: true, message: "Phone verified successfully." });
  } catch (error) {
    console.error("Phone verification error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// RESEND VERIFICATION 
export const resendVerificationEmail = async (req, res) => {
  const { emailOrPhone } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    let method;
    let contact;
    let verificationStatus;
    
    if (user.email === emailOrPhone) {
      method = "email";
      contact = user.email;
      verificationStatus = user.emailVerification;
    } else if (user.phone === emailOrPhone) {
      method = "sms";
      contact = user.phone;
      verificationStatus = user.phoneVerification;
    } else {
      return res.status(400).json({ success: false, message: "Contact information mismatch." });
    }

    if (verificationStatus?.verified) {
      return res.status(400).json({ success: false, message: `${method === 'email' ? 'Email' : 'Phone'} is already verified.` });
    }

    // Generate new code and expiry (1 hour)
    const newCode = Math.floor(100000 + Math.random() * 900000);
    const newExpiresAt = new Date(Date.now() + 3600 * 1000);

    if (method === "email") {
      user.emailVerification.code = newCode;
      user.emailVerification.expiresAt = newExpiresAt;
      await sendVerificationLink(contact, newCode, "email", user._id);
    } else if (method === "sms") {
      user.phoneVerification.code = newCode;
      user.phoneVerification.expiresAt = newExpiresAt;
      await sendVerificationLink(contact, newCode, "sms", user._id);
    }

    await user.save();
    
    res.status(200).json({ success: true, message: `New verification code/link sent to ${contact}.` });
  } catch (error) {
    console.error("Resend verification error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGIN 
export const login = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  if (!emailOrPhone || !password)
    return res.status(400).json({ success: false, message: "Missing credentials" });

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isEmailVerified = user.email ? user.emailVerification?.verified : true;
    const isPhoneVerified = user.phone ? user.phoneVerification?.verified : true;

    if (!isEmailVerified || !isPhoneVerified)
      return res.status(403).json({ success: false, message: "Account not verified" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// SEND PASSWORD RESET EMAIL 
export const sendPasswordResetEmail = async (req, res) => {
  const { emailOrPhone } = req.body;

  try {
    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: "If a user is registered with this information, a password reset link has been sent." 
      });
    }

    const resetToken = generateResetToken(user._id);

    user.resetToken = { token: resetToken, expiresAt: new Date(Date.now() + 600000) }; // 10 minutes
    await user.save();

    await sendVerificationLink(user.email, resetToken, "reset", user._id); 

    res.status(200).json({
      success: true,
      message: "If a user is registered with this information, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET USER PROFILE 
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash -resetToken"); // Exclude sensitive fields

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Profile fetch error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE PROFILE 
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const { name, phone, visionStatement, documents, bio, skills, availability, profilePicture } = req.body;

    if (name) user.name = name;
    if (phone && phoneRegex.test(phone)) user.phone = phone;
    if (visionStatement) user.visionStatement = visionStatement;
    if (bio) user.bio = bio;
    if (skills) user.skills = skills;
    if (availability) user.availability = availability;
    if (profilePicture) user.profilePicture = profilePicture;

    if (documents) {
      if (user.role === "student") user.studentDocuments = { ...user.studentDocuments, ...documents };
      if (user.role === "tutor") user.tutorDocuments = { ...user.tutorDocuments, ...documents };
    }

    await user.save();

    res.status(200).json({ success: true, message: "Profile updated", data: user });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};