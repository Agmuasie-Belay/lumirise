import mongoose from "mongoose";
import Module from "../models/module.model.js";
import User from "../models/user.model.js";
import ModuleEnrollment from "../models/enrollment.model.js";

// -------------------- ENROLL STUDENT --------------------
export const enrollStudent = async (req, res) => {
  const { moduleId } = req.params;
  const studentId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(moduleId)) {
    return res.status(400).json({ success: false, message: "Invalid module ID" });
  }

  try {
    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });

    // Prevent duplicate enrollment
    const existingEnrollment = await ModuleEnrollment.findOne({ student: studentId, module: moduleId });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: "Already enrolled" });
    }

    // Create new enrollment
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
      return res.status(200).json({ success: true, data: [], message: "No enrollments found" });
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

// -------------------- GET TUTOR STUDENTS --------------------
export const getTutorStudents = async (req, res) => {
  const tutorId = req.user.id;

  try {
    const enrollments = await ModuleEnrollment.find({ tutor: tutorId })
      .populate("student", "name email visionStatement")
      .populate("module", "title");

    // Map students uniquely
    const studentsMap = {};
    enrollments.forEach((enroll) => {
      const sId = enroll.student._id.toString();
      if (!studentsMap[sId]) {
        studentsMap[sId] = { ...enroll.student.toObject(), modules: [] };
      }
      studentsMap[sId].modules.push({
        moduleId: enroll.module._id,
        title: enroll.module.title,
        progressPercent: enroll.progressPercent,
      });
    });

    res.status(200).json({ success: true, data: Object.values(studentsMap) });
  } catch (error) {
    console.error("Fetch tutor students error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- UPDATE PROGRESS --------------------
export const updateProgress = async (req, res) => {
  const { enrollmentId } = req.params;
  const { progressPercent } = req.body;

  if (progressPercent < 0 || progressPercent > 100) {
    return res.status(400).json({ success: false, message: "Progress must be between 0 and 100" });
  }

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return res.status(400).json({ success: false, message: "Invalid enrollment ID" });
  }

  try {
    const enrollment = await ModuleEnrollment.findById(enrollmentId);
    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment not found" });

    // Only the tutor can update
    if (enrollment.tutor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    enrollment.progressPercent = progressPercent;
    await enrollment.save();

    res.status(200).json({ success: true, message: "Progress updated", data: enrollment });
  } catch (error) {
    console.error("Update progress error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
