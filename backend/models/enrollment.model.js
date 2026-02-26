import mongoose from "mongoose";

//Sub-schema: Daily Journal
const dailyJournalSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
  },
  whatIKnow: { type: String, required: true, minlength: 5 },
  whatIChanged: { type: String, required: true, minlength: 5 },
  whatChallengedMe: { type: String, required: true, minlength: 5 },
  tutorFeedback: {
    comment: { type: String, trim: true },
    feedbackGivenAt: { type: Date },
  },
});

// Sub-schema: Tutor-graded Task Submission
const taskSubmissionSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  score: { type: Number, default: null },
  submission: {
    text: { type: String, trim: true },
    link: { type: String, trim: true },
    fileUrl: String,
  },
  submittedAt: { type: Date },
  feedback: { type: String, default: "" },
  attemptCount: { type: Number, default: 0 },
  reviewedAt: { type: Date },
});

// Main ModuleEnrollment Schema,  One document per (student + module)
const moduleEnrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Block-Based Progress Tracking
    completedBlocks: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
    completedTimestamps: { type: Map, of: Date, default: {} },

    // Auto-graded quizzes
    quizAttempts: {
      type: Map,
      of: [
        {
          score: Number,
          submittedAt: Date,
        },
      ],
      default: {},
    },

    // Tutor-graded tasks / assignments
    taskSubmissions: { type: Map, of: taskSubmissionSchema, default: {} },

    // Overall progress
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },

    // Additional fields
    hourlyRate: { type: Number, min: 0 },
    expectedEndDate: { type: Date },
    studentRating: { type: Number, min: 0, max: 5 },
    tutorSuccessScore: { type: Number, min: 0, max: 100 },

    // Reflective Journals
    dailyJournals: [dailyJournalSchema],

    // Activity Tracking
    lastActivityAt: { type: Date, default: Date.now },
    finalScore: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Unique Enrollment Constraint
moduleEnrollmentSchema.index({ student: 1, module: 1 }, { unique: true });

// Validation Middleware
moduleEnrollmentSchema.pre("validate", async function (next) {
  try {
    const User = mongoose.model("User");
    const Module = mongoose.model("Module");

    // Validate student
    const student = await User.findById(this.student);
    if (!student) return next(new Error("Student does not exist"));
    if (student.role !== "student")
      return next(new Error("User is not a student"));

    // Validate module
    const moduleDoc = await Module.findById(this.module);
    if (!moduleDoc) return next(new Error("Module does not exist"));

    // Tutor must match module tutor
    if (moduleDoc.tutor.toString() !== this.tutor.toString()) {
      return next(new Error("Tutor must match the module's assigned tutor"));
    }

    // Validate expected end date
    if (this.expectedEndDate && this.expectedEndDate <= this.enrolledAt) {
      return next(new Error("Expected end date must be after enrollment date"));
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Activity Tracking Middleware
moduleEnrollmentSchema.pre("save", function (next) {
  if (
    this.isModified("progressPercent") ||
    this.isModified("completedBlocks") ||
    this.isModified("dailyJournals") ||
    this.isModified("taskSubmissions") ||
    this.isModified("quizAttempts")
  ) {
    this.lastActivityAt = new Date();
  }
  next();
});

export default mongoose.model("ModuleEnrollment", moduleEnrollmentSchema);
