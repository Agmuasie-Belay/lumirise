import mongoose from "mongoose";
const { Schema } = mongoose;

// Content Block Schema
const contentBlockSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["video", "ppt", "markdown", "mcq", "task"],
      required: true,
    },
    title: { type: String, trim: true },
    order: { type: Number, required: true },
    content: {
      type: Schema.Types.Mixed,
      required: function () {
        return this.type !== "mcq";
      },
    }, // For video URL, ppt link, markdown text, etc.
    // MCQ-specific fields
    questions: [
      {
        questionText: { type: String, required: true },
        options: [
          {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, default: false }, // only used for grading
          },
        ],
        type: { type: String, enum: ["mcq", "checkbox"], default: "mcq" },
        maxScore: { type: Number, default: 0 },
      },
    ],
    checkpoints: [
      {
        time: { type: Number, required: true }, // in seconds
        question: {
          type: new Schema(
            {
              type: {
                type: String,
                enum: ["multipleChoice", "trueFalse"],
                default: "multipleChoice",
              },
              text: { type: String, required: true },
              options: [{ type: String, required: true }],
              answer: { type: Number, required: true }, // index of correct option
            },
            { _id: false },
          ),
          required: false,
        },
      },
    ],
    // Optional: total max score for the block (used for grading)
    maxScore: { type: Number, default: 0 },
  },
  { _id: true },
);

contentBlockSchema.pre("validate", function (next) {
  if (this.type === "mcq" && this.questions?.length) {
    this.maxScore = this.questions.reduce(
      (total, q) => total + (q.maxScore || 0),
      0,
    );
  }
  next();
});

// Lesson Schema
const lessonSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true },
    blocks: [contentBlockSchema],
  },
  { _id: true },
);

// Feedback Schema
const feedbackSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

// Module Schema
const moduleSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true },
    tutor: { type: Schema.Types.ObjectId, ref: "User", required: true },

    objectives: [{ type: String }],
    tags: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    category: { type: String },

    lessons: [lessonSchema],

    status: {
      type: String,
      enum: ["Draft", "Pending", "Published", "Archived"],
      default: "Draft",
    },

    feedback: {
      type: [feedbackSchema],
      default: [],
    },
    bannerUrl: { type: String, default: "" },
    // Approval workflow
    pendingEdit: {
      isRequested: { type: Boolean, default: false },
      updatedFields: { type: Schema.Types.Mixed, default: {} },
      requestedAt: Date,
    },

    pendingAction: { type: String, enum: ["delete"], default: null },
    history: [
      {
        action: String,
        performedBy: { type: Schema.Types.ObjectId, ref: "User" },
        approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
        changes: Schema.Types.Mixed,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Module", moduleSchema);
