import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {authorizeRoles} from "../middlewares/roleMiddleware.js"
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getReports
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/users", getAllUsers);
router.get("/users/:userId", getUserById);
router.post("/users", createUser);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);

// Reports
router.get("/reports", getReports);

export default router;
