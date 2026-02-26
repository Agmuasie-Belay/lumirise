import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

import {
  getStudentEnrollments,
  getTutorStudents,
  enrollStudent,
  submitQuiz,
  getQuiz,
  giveFeedback,
  recordActivity,
  getStudentEnrollmentByModule,
  checkStudentEnrollment,
  submitTask,
  reviewTask,
  fetchTask,
} from "../controllers/enrollment.controller.js"; 

const router = express.Router();

// Student routes
router.get("/student", protect, authorizeRoles("student"), getStudentEnrollments);
router.post("/enroll/:moduleId", protect, authorizeRoles("student"), enrollStudent);
router.post("/:moduleId/activity", protect, authorizeRoles("student"), recordActivity);
router.post("/:enrollmentId/quiz", protect, authorizeRoles("student"), submitQuiz);
router.get("/:enrollmentId/quiz/:blockId", protect, authorizeRoles("student"), getQuiz);
router.post("/:enrollmentId/task/:taskId/submit", protect, authorizeRoles("student"), submitTask);
router.get("/:enrollmentId/task/:taskId", protect, authorizeRoles("student"), fetchTask);
router.get("/student/:moduleId/status", protect, authorizeRoles("student"), checkStudentEnrollment);

// Turor routes
router.post("/:moduleId/feedback", protect, authorizeRoles("tutor"), giveFeedback);
router.get("/tutor", protect, authorizeRoles("tutor"), getTutorStudents);
router.get("/enrollment/:moduleId", protect, getStudentEnrollmentByModule);
router.put("/:enrollmentId/task/:taskId/review", protect, authorizeRoles("tutor", "admin"), reviewTask);

export default router;