import mongoose from "mongoose";

// ==========================
// 4. 🤝 Main MentorshipSession Schema
// ==========================
const mentorshipSessionSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    description: { type: String },
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 15 },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "missed"],
      default: "scheduled",
    },

    meetingLink: { type: String },

    feedback: {
      fromStudent: { type: String },
      fromTutor: { type: String },
      rating: { type: Number, min: 0, max: 5 },
    },

    completedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

mentorshipSessionSchema.index(
  { student: 1, tutor: 1, module: 1, scheduledAt: 1 },
  { unique: true }
);

// ------------------------------
// VALIDATION FIX
// ------------------------------
mentorshipSessionSchema.pre("validate", async function (next) {
  const Module = mongoose.model("Module");
  const ModuleEnrollment = mongoose.model("ModuleEnrollment");

  // 1. Check if Module exists
  const moduleDoc = await Module.findById(this.module);
  if (!moduleDoc) return next(new Error("Module does not exist"));

  // 2. Check if the session tutor is the module's assigned tutor
  if (moduleDoc.tutor.toString() !== this.tutor.toString()) {
    return next(new Error("Tutor must be the module’s assigned tutor"));
  }

  // 3. Check if the student is actively enrolled in this module
  const exists = await ModuleEnrollment.findOne({
    student: this.student,
    module: this.module,
  });
  
  if (!exists) return next(new Error("Student is not enrolled in this module"));

  next();
});

// ==========================
// ✅ Model Export
// ==========================
export default mongoose.model("MentorshipSession", mentorshipSessionSchema);