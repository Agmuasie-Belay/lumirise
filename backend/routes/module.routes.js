import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
  getModules,
  createModule,
  updateModule,
  deleteModule,
  enrollModule,
  updateProgress,
  giveFeedback,
  recordActivity,
  approveModule,
  rejectModule,
  requestApproval
} from "../controllers/module.controller.js";

const router = express.Router();

// Get modules (any authenticated user)
router.get("/", protect, getModules);

// Student: enroll, record activity
router.post("/:id/enroll", protect, authorizeRoles("student"), enrollModule);
router.post("/:moduleId/activity", protect, authorizeRoles("student"), recordActivity);

// Tutor: create, update, delete, give feedback, manual progress update
router.post("/", protect, authorizeRoles("tutor"), createModule);
router.put("/:id", protect, authorizeRoles("tutor"), updateModule);
router.delete("/:id", protect, authorizeRoles("tutor"), deleteModule);
router.post("/:moduleId/feedback", protect, authorizeRoles("tutor"), giveFeedback);
router.put("/:moduleId/progress", protect, authorizeRoles("tutor"), updateProgress);

// Admin: approve/reject modules
router.put("/:id/approve", protect, authorizeRoles("admin"), approveModule);
router.put("/:id/reject", protect, authorizeRoles("admin"), rejectModule);
router.put("/:id/request-approval", protect, authorizeRoles("tutor"), requestApproval);
export default router;
