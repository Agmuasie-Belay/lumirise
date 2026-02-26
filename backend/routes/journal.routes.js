import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

import {
  createDailyJournal,
  updateDailyJournal,
  deleteDailyJournal,
  tutorJournalView
} from "../controllers/journal.controller.js"; 
const router = express.Router();

router.post("/:enrollmentId/journal", protect, authorizeRoles("student"),createDailyJournal);
router.put("/:enrollmentId/journal/:journalId", protect, authorizeRoles("student"), updateDailyJournal);
router.delete("/:enrollmentId/journal/:journalId", protect, authorizeRoles("student"), deleteDailyJournal);
router.get("/:enrollmentId/journals", protect,authorizeRoles("student","tutor"),tutorJournalView);

export default router;
