import mongoose from "mongoose";

// ==========================
// 📓 Sub-schema: Daily Journals
// ==========================
const dailyJournalSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  whatIKnow: { type: String, required: true, minlength: 5 },
  whatIChanged: { type: String, required: true, minlength: 5 },
  whatChallengedMe: { type: String, required: true, minlength: 5 },
  // Allows Tutor to provide direct feedback on the journal entry.
  tutorFeedback: {
    comment: { type: String, trim: true },
    feedbackGivenAt: { type: Date },
  },
});

// ==========================
// 3. 📝 Main ModuleEnrollment Schema
// Handles Student Progress Tracking and Daily Journaling
// ==========================
const moduleEnrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    hourlyRate: { type: Number, required: true, min: 0 },

    studentRating: { type: Number, min: 0, max: 5 },
    tutorSuccessScore: { type: Number, min: 0, max: 100 },

    progressPercent: { type: Number, default: 0, min: 0, max: 100 },

    enrolledAt: { type: Date, default: Date.now },
    expectedEndDate: { type: Date, required: true },

    completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Task" }],
    completedMCQs: [{ type: mongoose.Schema.Types.ObjectId, ref: "MCQ" }],
    
    dailyJournals: [dailyJournalSchema],

    lastActivityAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

moduleEnrollmentSchema.index({ student: 1, module: 1 }, { unique: true });

// ------------------------------------
// VALIDATION FIXES
// ------------------------------------
moduleEnrollmentSchema.pre("validate", async function (next) {
  // Use `mongoose.model()` to access models defined elsewhere
  const User = mongoose.model("User");
  const Module = mongoose.model("Module");

  const student = await User.findById(this.student);
  if (!student) return next(new Error("Student does not exist"));
  if (student.role !== "student") return next(new Error("User is not a student"));

  const moduleDoc = await Module.findById(this.module);
  if (!moduleDoc) return next(new Error("Module does not exist"));

  if (moduleDoc.tutor.toString() !== this.tutor.toString()) {
    return next(new Error("Tutor assigned must match the module's tutor"));
  }

  if (this.expectedEndDate <= this.enrolledAt) {
    return next(new Error("Expected end date must be after enrollment date"));
  }

  next();
});

moduleEnrollmentSchema.pre("save", function (next) {
  if (this.isModified("progressPercent") || this.isModified("completedTasks") || this.isModified("completedMCQs") || this.isModified("dailyJournals")) {
    this.lastActivityAt = new Date();
  }
  next();
});

// ==========================
// ✅ Model Export
// ==========================
export default mongoose.model("ModuleEnrollment", moduleEnrollmentSchema);