import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";
import {
  getModules,
  getModuleById,
  createModule,
  updateModule,
  requestApproval,
  approveModule,
  rejectModule,
  requestDelete,
  approveDeleteRequest,
  requestEdit,
  approveEditRequest,
} from "../controllers/module.controller.js";

const router = express.Router();

// Public/Student Access
router.get("/", protect, getModules);
router.get("/:id", protect, getModuleById);

// Tutor Endpoints
router.post("/", protect, authorizeRoles("tutor"), createModule);
router.put("/:id", protect, authorizeRoles("tutor"), updateModule);
router.put("/:id/request-approval", protect, authorizeRoles("tutor"), requestApproval);
router.put("/:id/request-delete", protect, authorizeRoles("tutor"), requestDelete);
router.put("/:id/request-edit", protect, authorizeRoles("tutor"), requestEdit);

// Admin Endpoints
router.put("/:id/approve", protect, authorizeRoles("admin"), approveModule);
router.put("/:id/reject", protect, authorizeRoles("admin"), rejectModule);
router.put("/:id/approve-delete", protect, authorizeRoles("admin"), approveDeleteRequest);
router.put("/:id/approve-edit", protect, authorizeRoles("admin"), approveEditRequest);

export default router;
