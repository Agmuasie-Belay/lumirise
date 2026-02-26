import mongoose from "mongoose";
import Module from "../models/module.model.js";
import ModuleEnrollment from "../models/enrollment.model.js";

const computeModuleProgress = (module, enrollment) => {
  const totalBlocks = module.lessons.reduce(
    (acc, lesson) => acc + lesson.blocks.length,
    0,
  );

  if (totalBlocks === 0) return 0;

  const uniqueCompleted = new Set(
    enrollment.completedBlocks.map((id) => id.toString()),
  );

  return Math.round((uniqueCompleted.size / totalBlocks) * 100);
};
// -------------------- ENROLL STUDENT --------------------
export const enrollStudent = async (req, res) => {
  const { moduleId } = req.params;
  const studentId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(moduleId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid module ID" });
  }

  try {
    const module = await Module.findById(moduleId);
    if (!module)
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });

    const existingEnrollment = await ModuleEnrollment.findOne({
      student: studentId,
      module: moduleId,
    });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ success: false, message: "Already enrolled" });
    }

    const enrollment = new ModuleEnrollment({
      student: studentId,
      module: moduleId,
      tutor: module.tutor,
      hourlyRate: module.defaultHourlyRate || 0,
      progressPercent: 0,
      studentRating: null,
      tutorSuccessScore: null,
      enrolledAt: new Date(),
    });

    await enrollment.save();

    res.status(201).json({
      success: true,
      message: "Enrolled successfully",
      data: enrollment,
    });
  } catch (error) {
    console.error("Enrollment error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- GET STUDENT MODULES --------------------
export const getStudentModules = async (req, res) => {
  const studentId = req.user.id;

  try {
    const enrollments = await ModuleEnrollment.find({ student: studentId })
      .populate("module", "title description category")
      .populate("tutor", "name email perHourRate successRate");

    res.status(200).json({ success: true, data: enrollments });
  } catch (error) {
    console.error("Fetch student modules error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- GET STUDENT ENROLLMENTS --------------------
export const getStudentEnrollments = async (req, res) => {
  const studentId = req.user.id;

  try {
    const enrollments = await ModuleEnrollment.find({ student: studentId })
      .populate("module", "title description category tutor createdAt")
      .populate("tutor", "name email");

    if (!enrollments.length) {
      return res
        .status(200)
        .json({ success: true, data: [], message: "No enrollments found" });
    }

    const formatted = enrollments.map((enroll) => ({
      enrollmentId: enroll._id,
      moduleId: enroll.module._id,
      title: enroll.module.title,
      category: enroll.module.category,
      tutor: enroll.tutor,
      progressPercent: enroll.progressPercent,
      enrolledAt: enroll.enrolledAt,
      studentRating: enroll.studentRating,
      tutorSuccessScore: enroll.tutorSuccessScore,
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Fetch student enrollments error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Single enrollment
// Controller to get a specific module enrollment for a student
export const getStudentEnrollmentByModule = async (req, res) => {
  const studentId = req.user.id;
  const { moduleId } = req.params; // moduleId from the URL

  try {
    const enrollment = await ModuleEnrollment.findOne({
      student: studentId,
      module: moduleId,
    })
      .populate("module", "title description category tutor createdAt")
      .populate("tutor", "name email");

    if (!enrollment) {
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    }

    const formatted = {
      enrollmentId: enrollment._id,
      moduleId: enrollment.module._id,
      title: enrollment.module.title,
      category: enrollment.module.category,
      tutor: enrollment.tutor,
      progressPercent: enrollment.progressPercent,
      completedBlocks: enrollment.completedBlocks,
      enrolledAt: enrollment.enrolledAt,
      studentRating: enrollment.studentRating,
      tutorSuccessScore: enrollment.tutorSuccessScore,
    };

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    console.error("Fetch module enrollment error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const checkStudentEnrollment = async (req, res) => {
  const studentId = req.user._id;
  const { moduleId } = req.params;

  try {
    const enrollment = await ModuleEnrollment.findOne({
      student: studentId,
      module: moduleId,
    }).select("_id progressPercent enrolledAt");

    if (!enrollment) {
      return res.status(200).json({
        success: true,
        enrolled: false,
        enrollmentId: null,
        progressPercent: null,
      });
    }

    return res.status(200).json({
      success: true,
      enrolled: true,
      enrollmentId: enrollment._id,
      progressPercent: enrollment.progressPercent,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// -------------------- GET TUTOR STUDENTS --------------------
export const getTutorStudents = async (req, res) => {
  const tutorId = req.user.id;

  try {
    const enrollments = await ModuleEnrollment.find({ tutor: tutorId })
      .populate("student", "name email visionStatement")
      .populate("module", "title");
    const studentsMap = {};
    console.log(enrollments);
    enrollments.forEach((enroll) => {
      const sId = enroll.student._id.toString();
      if (!studentsMap[sId]) {
        studentsMap[sId] = { ...enroll.student.toObject(), modules: [] };
      }
      studentsMap[sId].modules.push({
        enrollmentId: enroll._id,
        moduleId: enroll.module._id,
        title: enroll.module.title,
        progressPercent: enroll.progressPercent,
        enrolledAt: enroll.enrolledAt,
        taskSubmissions: enroll.taskSubmissions,
        completedBlocks: enroll.completedBlocks,
        quizAttempts: enroll.quizAttempts,
        finalScore: enroll.finalScore,
        passed: enroll.passed,
        dailyJournals: enroll.dailyJournals,
      });
    });

    res.status(200).json({ success: true, data: Object.values(studentsMap) });
  } catch (error) {
    console.error("Fetch tutor students error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const MAX_ATTEMPTS = 3;

export const submitTask = async (req, res) => {
  const { enrollmentId, taskId } = req.params;
  const { submission, type } = req.body;
  if (!mongoose.Types.ObjectId.isValid(enrollmentId))
    return res
      .status(400)
      .json({ success: false, message: "Invalid enrollment ID" });

  if (!submission)
    return res.status(400).json({
      success: false,
      message: "Task submission must include text or link",
    });

  try {
    const enrollment =
      await ModuleEnrollment.findById(enrollmentId).populate("module");
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    if (!enrollment.taskSubmissions) enrollment.taskSubmissions = new Map();

    const existingSubmission = enrollment.taskSubmissions.get(taskId);

    const attemptsUsed = existingSubmission?.attemptCount || 0;
    const isApproved = existingSubmission?.status === "approved";

    // Block if already approved
    if (isApproved) {
      return res.status(400).json({
        success: false,
        message: "Task already approved. Resubmission not allowed.",
      });
    }

    // Block if max attempts reached
    if (attemptsUsed >= MAX_ATTEMPTS) {
      return res.status(400).json({
        success: false,
        message: `Maximum attempts reached (${MAX_ATTEMPTS})`,
      });
    }

    // Prepare submission object
    const submissionObj = {
      status: "pending",
      score: null,
      submission: {
        text: type === "text" ? submission : "",
        link: type === "link" ? submission : "",
      },
      submittedAt: new Date(),
      feedback: "",
      attemptCount: attemptsUsed + 1, // increment attempt
    };

    // Save submission
    enrollment.taskSubmissions.set(taskId, submissionObj);

    // Update progress
    enrollment.progressPercent = computeModuleProgress(
      enrollment.module,
      enrollment,
    );
    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: "Task submitted successfully and pending review",
      progressPercent: enrollment.progressPercent,
      submission: submissionObj,
      // taskSubmissions:existingSubmission
    });
  } catch (err) {
    console.error("Submit task error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const fetchTask = async (req, res) => {
  const { enrollmentId, taskId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(enrollmentId))
    return res
      .status(400)
      .json({ success: false, message: "Invalid enrollment ID" });

  try {
    const enrollment =
      await ModuleEnrollment.findById(enrollmentId).populate("module");
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    const existingSubmission = enrollment.taskSubmissions.get(taskId);
    return res.status(200).json({
      success: true,
      message: "Task fetched successfully",
      taskSubmissions: existingSubmission,
    });
  } catch (err) {
    console.error("Fetch task error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const autoGradeQuiz = (mcqBlock, studentAnswers) => {
  if (!mcqBlock || mcqBlock.type !== "mcq") return 0;

  const questions = mcqBlock.questions || [];
  if (!questions.length) return 0;

  let totalEarned = 0;
  let totalPossible = 0;
  questions.forEach((question, qIndex) => {
    const { options = [], type = "mcq", maxScore = 1 } = question;

    totalPossible += maxScore;

    const studentAnswer = studentAnswers[qIndex].selected;

    const correctIndexes = options
      .map((opt, index) => (opt.isCorrect ? index : null))
      .filter((val) => val !== null);
    // === Single Select ===
    if (type === "mcq") {
      if (
        studentAnswer.length === 1 &&
        correctIndexes.includes(studentAnswer[0])
      ) {
        totalEarned += maxScore;
      }
    }

    // === Multiple Select ===
    if (type === "checkbox") {
      const allCorrectSelected = correctIndexes.every((idx) =>
        studentAnswer.includes(idx),
      );

      const noExtraSelected = studentAnswer.every((idx) =>
        correctIndexes.includes(idx),
      );

      if (allCorrectSelected && noExtraSelected) {
        totalEarned += maxScore;
      }
    }
  });

  return totalPossible ? Math.round((totalEarned / totalPossible) * 100) : 0;
};

// PUT /modules/:moduleId/progress (tutor/admin)
export const updateProgress = async (req, res) => {
  const { moduleId } = req.params;
  const { studentId, progressPercent } = req.body;

  if (
    !mongoose.Types.ObjectId.isValid(moduleId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  )
    return res
      .status(400)
      .json({ success: false, message: "Invalid module or student ID" });

  const newProgress = Number(progressPercent);
  if (isNaN(newProgress) || newProgress < 0 || newProgress > 100)
    return res
      .status(400)
      .json({ success: false, message: "Progress must be 0-100" });

  try {
    const module = await Module.findById(moduleId).select("tutor");
    if (!module)
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });

    if (module.tutor.toString() !== req.user.id && req.user.role !== "admin")
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    const enrollment = await ModuleEnrollment.findOneAndUpdate(
      { module: moduleId, student: studentId },
      { progressPercent: newProgress },
      { new: true },
    );

    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment record not found" });

    res.status(200).json({
      success: true,
      message: `Progress updated to ${newProgress}%`,
      data: enrollment.progressPercent,
    });
  } catch (error) {
    console.error("Error updating progress:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /modules/:moduleId/feedback (tutor/admin)
export const giveFeedback = async (req, res) => {
  const { moduleId } = req.params;
  const { comment, rating } = req.body;
  const studentId = req.user.id;

  try {
    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ success: false });

    module.feedback.push({
      student: studentId,
      comment,
      rating,
    });

    await module.save();

    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// COMPLETE BLOCK (student)
export const completeBlock = async (req, res) => {
  const { enrollmentId } = req.params;
  const { blockId } = req.body;
  const studentId = req.user.id;

  if (
    !mongoose.Types.ObjectId.isValid(enrollmentId) ||
    !mongoose.Types.ObjectId.isValid(blockId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid enrollment or block ID" });
  }

  try {
    const enrollment =
      await ModuleEnrollment.findById(enrollmentId).populate("module");
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });
    if (enrollment.student.toString() !== studentId)
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    const blockExists = enrollment.module.lessons.some((lesson) =>
      lesson.blocks.some((block) => block._id.toString() === blockId),
    );
    if (!blockExists)
      return res
        .status(404)
        .json({ success: false, message: "Block not found" });

    const alreadyCompleted = enrollment.completedBlocks.some(
      (id) => id.toString() === blockId,
    );

    if (!alreadyCompleted) {
      enrollment.completedBlocks.push(blockId);
      enrollment.completedTimestamps.set(blockId, new Date());
    }

    // Rec progress based on completed lessons
    enrollment.progressPercent = computeModuleProgress(
      enrollment.module,
      enrollment,
    );

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Block marked as complete",
      progressPercent: enrollment.progressPercent,
      completedBlocks: enrollment.completedBlocks,
    });
  } catch (err) {
    console.error("Complete block error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- SUBMIT QUIZ (STUDENT) --------------------
export const submitQuiz = async (req, res) => {
  const { enrollmentId } = req.params;
  const { blockId, answers } = req.body;
  const studentId = req.user.id;
  try {
    const enrollment = await ModuleEnrollment.findOne({
      _id: enrollmentId,
      student: studentId,
    });
    console.log(enrollment.quizAttempts);
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    const module = await Module.findById(enrollment.module);
    if (!module)
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });

    // Find the quiz block
    let block = null;
    module.lessons.forEach((lesson) => {
      lesson.blocks.forEach((b) => {
        if (b._id.toString() === blockId) block = b;
      });
    });

    if (!block || block.type !== "mcq")
      return res
        .status(404)
        .json({ success: false, message: "Quiz block not found" });

    // Initialize quiz attempts map if missing
    if (!enrollment.quizAttempts) enrollment.quizAttempts = new Map();
    if (!enrollment.quizAttempts.has(blockId))
      enrollment.quizAttempts.set(blockId, []);
    const attempts = enrollment.quizAttempts.get(blockId);

    const MAX_ATTEMPTS = 3;

    if (attempts.length >= MAX_ATTEMPTS) {
      return res.status(400).json({
        success: false,
        message: "Maximum attempts reached",
        attemptsUsed: attempts.length,
        attemptsRemaining: 0,
      });
    }

    // Auto-grade using updated function
    const score = autoGradeQuiz(block, answers);

    attempts.push({
      score,
      submittedAt: new Date(),
      answers,
    });

    enrollment.quizAttempts.set(blockId, attempts);
    // Mark block complete if score >= 50
    if (score >= 50 && !enrollment.completedBlocks.includes(blockId)) {
      enrollment.completedBlocks.push(blockId);
      enrollment.completedTimestamps.set(blockId, new Date());
    }

    // Recompute progress
    enrollment.progressPercent = computeModuleProgress(module, enrollment);

    await enrollment.save();
    const highestScore = Math.max(...attempts.map((a) => a.score));

    res.status(200).json({
      success: true,
      score,
      highestScore,
      attemptsUsed: attempts.length,
      attemptsRemaining: MAX_ATTEMPTS - attempts.length,
      allAttempts: attempts,
      progressPercent: enrollment.progressPercent,
      isPassed: highestScore >= 50, // certification logic uses highest
    });
  } catch (err) {
    console.error("Submit quiz error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getQuiz = async (req, res) => {
  const { enrollmentId, blockId } = req.params;
  const studentId = req.user.id;

  try {
    const enrollment = await ModuleEnrollment.findOne({
      _id: enrollmentId,
      student: studentId,
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    const MAX_ATTEMPTS = 3;

    const attempts = enrollment.quizAttempts?.get(blockId) || [];

    const attemptsUsed = attempts.length;
    const attemptsRemaining = MAX_ATTEMPTS - attemptsUsed;

    const lastScore =
      attemptsUsed > 0 ? attempts[attemptsUsed - 1].score : null;

    const highestScore =
      attemptsUsed > 0 ? Math.max(...attempts.map((a) => a.score)) : null;

    const isPassed = highestScore >= 50;

    // Remove answers before sending to frontend
    const safeAttempts = attempts.map((a) => ({
      score: a.score,
      submittedAt: a.submittedAt,
    }));

    return res.status(200).json({
      success: true,
      attemptsUsed,
      attemptsRemaining,
      lastScore,
      highestScore,
      isPassed,
      allAttempts: safeAttempts, // no answers exposed
    });
  } catch (err) {
    console.error("Get quiz error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Record student activity
export const recordActivity = async (req, res) => {
  const { moduleId } = req.params;
  const { blockId } = req.body;
  const studentId = req.user.id;

  if (
    !mongoose.Types.ObjectId.isValid(moduleId) ||
    !mongoose.Types.ObjectId.isValid(blockId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid module or block ID" });
  }

  try {
    const module = await Module.findById(moduleId);
    if (!module)
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });

    const enrollment = await ModuleEnrollment.findOne({
      student: studentId,
      module: moduleId,
    });
    if (!enrollment)
      return res.status(400).json({ success: false, message: "Not enrolled" });

    // Verify block exists
    const blockExists = module.lessons.some((lesson) =>
      lesson.blocks.some((block) => block._id.toString() === blockId),
    );
    if (!blockExists)
      return res
        .status(404)
        .json({ success: false, message: "Block not found" });

    // Mark block complete
    const alreadyCompleted = enrollment.completedBlocks.some(
      (id) => id.toString() === blockId,
    );

    if (!alreadyCompleted) {
      enrollment.completedBlocks.push(blockId);
      enrollment.completedTimestamps.set(blockId, new Date());
    }

    enrollment.progressPercent = computeModuleProgress(module, enrollment);
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Activity recorded",
      progressPercent: enrollment.progressPercent,
    });
  } catch (err) {
    console.error("Record activity error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const reviewTask = async (req, res) => {
  const { enrollmentId, taskId } = req.params;
  const { status, score, feedback } = req.body;
console.log("Reviewing task:", { enrollmentId, taskId, status, score, feedback });
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be approved or rejected",
    });
  }

  try {
    const enrollment =
      await ModuleEnrollment.findById(enrollmentId).populate("module");

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    // Authorization check
    if (
      enrollment.tutor.toString() !== req.user.id &&
      req.user.role !== "tutor"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const task = enrollment.taskSubmissions.get(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task submission not found",
      });
    }
    if (task.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "Task already approved",
      });
    }

    if (score !== undefined && (score < 0 || score > 100)) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 0 and 100",
      });
    }
    // Update task
    task.status = status;
    task.score = score ?? null;
    task.feedback = feedback || "";
    task.reviewedAt = new Date();

    // ✅ If approved → mark block complete
    if (status === "approved") {
      if (!enrollment.completedBlocks.includes(taskId)) {
        enrollment.completedBlocks.push(taskId);
        enrollment.completedTimestamps.set(taskId, new Date());
      }
    }

    // Recalculate progress
    enrollment.progressPercent = computeModuleProgress(
      enrollment.module,
      enrollment,
    );

    await enrollment.save();

    res.status(200).json({
      success: true,
      message: "Task reviewed successfully",
      progressPercent: enrollment.progressPercent,
      finalScore: enrollment.finalScore,
    });
  } catch (err) {
    console.error("Review task error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
// POST /modules/:moduleId/grade
export const gradeModule = async (req, res) => {
  const { moduleId } = req.params;
  const { studentId, weights } = req.body;
  // weights = { tasks: 0.4, quizzes: 0.5, completion: 0.1 }

  if (
    !mongoose.Types.ObjectId.isValid(moduleId) ||
    !mongoose.Types.ObjectId.isValid(studentId)
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid module or student ID" });
  }

  try {
    const module = await Module.findById(moduleId);
    if (!module)
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });

    const enrollment = await ModuleEnrollment.findOne({
      module: moduleId,
      student: studentId,
    });
    if (!enrollment)
      return res
        .status(404)
        .json({ success: false, message: "Enrollment not found" });

    // ------------------ Task Score ------------------
    const taskSubmissions = enrollment.taskSubmissions
      ? Array.from(enrollment.taskSubmissions.values()).filter(
          (t) => t.status === "approved" && t.score !== null,
        )
      : [];
    const taskScore =
      taskSubmissions.length > 0
        ? taskSubmissions.reduce((sum, t) => sum + t.score, 0) /
          taskSubmissions.length
        : 0;

    // ------------------ Quiz Score ------------------
    const quizScores = [];
    if (enrollment.quizAttempts) {
      for (const attempts of enrollment.quizAttempts.values()) {
        const highest = Math.max(...attempts.map((a) => a.score || 0));
        quizScores.push(highest);
      }
    }
    const quizScore =
      quizScores.length > 0
        ? quizScores.reduce((sum, s) => sum + s, 0) / quizScores.length
        : 0;

    // ------------------ Completion Score ------------------
    const totalBlocks = module.lessons.reduce(
      (acc, lesson) => acc + lesson.blocks.length,
      0,
    );
    const completedBlocks = enrollment.completedBlocks.length;
    const completionScore =
      totalBlocks > 0 ? (completedBlocks / totalBlocks) * 100 : 0;

    // ------------------ Weighted Overall ------------------
    const w = weights || { tasks: 0.4, quizzes: 0.5, completion: 0.1 };
    const overallScore =
      taskScore * w.tasks +
      quizScore * w.quizzes +
      completionScore * w.completion;

    const passed = overallScore >= 50; // or any pass threshold

    // Save result in enrollment
    enrollment.finalScore = overallScore;
    enrollment.passed = passed;
    await enrollment.save();

    res.status(200).json({
      success: true,
      data: {
        taskScore,
        quizScore,
        completionScore,
        overallScore,
        passed,
      },
    });
  } catch (err) {
    console.error("Grade module error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
