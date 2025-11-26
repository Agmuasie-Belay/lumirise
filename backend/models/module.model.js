import mongoose from "mongoose";
const { Schema } = mongoose;

// ==========================
// 📝 MCQ Schema (Nested under Lesson)
// ==========================
const mcqSchema = new Schema({
  question: { type: String, required: true, trim: true },
  options: [{ type: String, required: true, trim: true }],
  correctAnswer: { type: String, required: true, trim: true },
  order: { type: Number, default: 1 },
});

// ==========================
// 🎯 Task Schema (Nested under Lesson)
// ==========================
const taskSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  required: { type: Boolean, default: true },
  estimatedTime: { type: Number, min: 1 },
  order: { type: Number, default: 1 },
});

// ==========================
// 🗒️ Lesson Schema
// ==========================
const lessonSchema = new Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, trim: true },
  videoLinks: [{ type: String, trim: true }],
  readingFiles: [{ type: String, trim: true }],
  order: { type: Number, required: true },
  tasks: [taskSchema],
  mcqs: [mcqSchema],
});

// ==========================
// ⭐ Feedback Schema
// ==========================
const feedbackSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tutor: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comment: { type: String, trim: true },
  rating: { type: Number, min: 0, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

// ==========================
// 📚 Module Schema
// ==========================
const moduleSchema = new Schema(
  {
    title: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, trim: true },
    objectives: [{ type: String, trim: true }],
    lessons: [lessonSchema],
    hourlyRate: { type: Number }, // optional: overrides tutor's default
    tutor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: "User" }],
    feedback: [feedbackSchema],
    status: { type: String, enum: ["Draft", "Published", "Pending", "Rejected"], default: "Draft" },
    difficulty: { type: String, enum: ["beginner", "intermediate", "advanced"], default: "beginner" },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true, lowercase: true }],
    startDate: Date,
    endDate: Date,
    pendingEdit: {
      isRequested: { type: Boolean, default: false },
      updatedFields: { type: Object, default: {} },
      requestedAt: Date,
    },
    pendingDelete: {
      isRequested: { type: Boolean, default: false },
      requestedAt: Date,
    },
    history: [
      {
        action: { type: String, enum: ["edit", "delete"], required: true },
        performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
        changes: { type: Object },
      },
    ],
  },
  { timestamps: true }
);

// ==========================
// Virtuals
// ==========================
moduleSchema.virtual("totalLessons").get(function () {
  return this.lessons.length;
});
moduleSchema.virtual("totalTasks").get(function () {
  return this.lessons.reduce((sum, l) => sum + l.tasks.length, 0);
});
moduleSchema.virtual("totalMCQs").get(function () {
  return this.lessons.reduce((sum, l) => sum + l.mcqs.length, 0);
});

// Index
moduleSchema.index({ tutor: 1 });
moduleSchema.index({ category: 1 });

export default mongoose.model("Module", moduleSchema);
