import express from "express";
import {
  getJournal,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
} from "../controllers/journal.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // adjust path/name to your existing middleware

const router = express.Router();

// all endpoints require auth
router.get("/", authMiddleware, getJournal);
router.post("/", authMiddleware, addJournalEntry);
router.put("/:entryId", authMiddleware, updateJournalEntry);
router.delete("/:entryId", authMiddleware, deleteJournalEntry);

export default router;
