import mongoose from "mongoose";
import validator from "validator";

// ==========================
// 🧠 Sub-schema: Tutor Assessments
// ==========================
const tutorAssessmentSchema = new mongoose.Schema({
  technicalSkills: [
    {
      skill: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 100 },
    },
  ],
  softSkills: [
    {
      skill: { type: String, required: true },
      score: { type: Number, required: true, min: 0, max: 100 },
    },
  ],
  personality: {
    openness: { type: Number, min: 0, max: 100 },
    conscientiousness: { type: Number, min: 0, max: 100 },
    extraversion: { type: Number, min: 0, max: 100 },
    agreeableness: { type: Number, min: 0, max: 100 },
    neuroticism: { type: Number, min: 0, max: 100 },
  },
  assessedAt: { type: Date, default: Date.now },
});

// ==========================
// 📂 Sub-schema: Uploaded Documents
// ==========================
const documentSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// ==========================
// 📩 Sub-schema: Notifications
// ==========================
const notificationSubSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    message: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["info", "alert", "reminder", "feedback", "system"],
      default: "info",
    },
    relatedEntity: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedEntityType' },
    relatedEntityType: { type: String, enum: ['Module', 'MentorshipSession', 'User'] },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ==========================
// 1. 👤 Main User Schema
// ==========================
const userSchema = new mongoose.Schema(
  {
    // ------------------
    // Basic Info
    // ------------------
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email address"],
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\+?\d{10,15}$/.test(v),
        message: "Invalid phone number",
      },
    },
    passwordHash: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: (v) => /[A-Za-z]/.test(v) && /\d/.test(v),
        message: "Password must contain at least one letter and one number",
      },
    },
    role: { type: String, enum: ["student", "tutor", "admin"], required: true },

    // ------------------
    // Verification
    // ------------------
    emailVerification: {
      code: { type: String },
      expiresAt: { type: Date },
      verified: { type: Boolean, default: false },
    },
    phoneVerification: {
      code: { type: String },
      expiresAt: { type: Date },
      verified: { type: Boolean, default: false },
    },
    canUploadDocuments: { type: Boolean, default: false },

    // ------------------
    // Student-specific
    // ------------------
    visionStatement: {
      type: String,
      minlength: 20,
      maxlength: 100,
      validate: {
        validator: function (v) {
          if (this.role === "student") {
            return v && v.length >= 20;
          }
          return true;
        },
        message: "Vision statement must be at least 20 characters for students.",
      },
    },
    studentDocuments: {
      validId: { type: documentSchema },
      agreementForm: { type: documentSchema },
      gradeReports: { type: [documentSchema], default: [] },
      verified: { type: Boolean, default: false },
      submittedAt: { type: Date },
    },

    // ------------------
    // Tutor-specific
    // ------------------
    coursesRegistered: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
    ],
    tutorAssessments: tutorAssessmentSchema,
    tutorDocuments: {
      validId: { type: documentSchema },
      agreementForm: { type: documentSchema },
      verified: { type: Boolean, default: false },
      submittedAt: { type: Date },
    },

    // ------------------
    // Common
    // ------------------
    profilePicture: { type: String, default: "" },
    bio: { type: String, trim: true, maxlength: 500 },
    skills: [{ type: String }],
    availability: {
      days: [
        {
          type: String,
          enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
      ],
      startTime: String,
      endTime: String,
    },
    defaultHourlyRate: { type: Number, default: 0 },
    // ------------------
    // Notifications
    // ------------------
    notifications: [notificationSubSchema],
  },
  { timestamps: true }
);

// ------------------------------
// PRE-SAVE HOOK & TRANSFORMATION
// ------------------------------
userSchema.pre("save", function (next) {
  if (this.isModified("notifications") && Array.isArray(this.notifications)) {
    const uniqueMap = new Map();
    this.notifications.forEach((notif) => {
      const key = `${notif.message}-${notif.relatedEntity || ""}-${
        notif.sender || ""
      }`;
      if (!uniqueMap.has(key)) uniqueMap.set(key, notif);
    });
    this.notifications = Array.from(uniqueMap.values());
  }
  next();
});

userSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

// ==========================
// ✅ Model Export
// ==========================
export default mongoose.model("User", userSchema);