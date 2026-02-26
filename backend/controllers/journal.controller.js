import mongoose from "mongoose";
import ModuleEnrollment from "../models/enrollment.model.js";

// Helper: check if within 24 hours
const isWithin24Hours = (date) => {
  const now = new Date();
  return now - date <= 24 * 60 * 60 * 1000; // 24 hours in ms
};

// -------------------- CREATE DAILY JOURNAL --------------------
export const createDailyJournal = async (req, res) => {
  const { enrollmentId } = req.params;
  const { whatIKnow, whatIChanged, whatChallengedMe } = req.body;
  const studentId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId)) {
    return res.status(400).json({ success: false, message: "Invalid enrollment ID" });
  }

  try {
    const enrollment = await ModuleEnrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    if (enrollment.student.toString() !== studentId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (enrollment.passed) {
      return res.status(400).json({ success: false, message: "Cannot submit journal after passing module" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingJournal = enrollment.dailyJournals.find(
      (j) => j.date >= today
    );

    if (existingJournal) {
      return res.status(400).json({ success: false, message: "Journal already submitted today" });
    }

    const journal = {
      whatIKnow,
      whatIChanged,
      whatChallengedMe,
      date: new Date(),
    };

    enrollment.dailyJournals.push(journal);
    await enrollment.save();

    res.status(201).json({ success: true, data: journal, message: "Journal submitted successfully" });
  } catch (err) {
    console.error("Create journal error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- UPDATE DAILY JOURNAL --------------------
export const updateDailyJournal = async (req, res) => {
  const { enrollmentId, journalId } = req.params;
  const { whatIKnow, whatIChanged, whatChallengedMe } = req.body;
  const studentId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId) || !mongoose.Types.ObjectId.isValid(journalId)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  try {
    const enrollment = await ModuleEnrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    if (enrollment.student.toString() !== studentId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (enrollment.passed) {
      return res.status(400).json({ success: false, message: "Cannot edit journal after passing module" });
    }

    const journal = enrollment.dailyJournals.id(journalId);
    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }

    if (!isWithin24Hours(journal.date)) {
      return res.status(400).json({ success: false, message: "Can only edit within 24 hours of submission" });
    }

    // Update fields
    if (whatIKnow) journal.whatIKnow = whatIKnow;
    if (whatIChanged) journal.whatIChanged = whatIChanged;
    if (whatChallengedMe) journal.whatChallengedMe = whatChallengedMe;

    await enrollment.save();

    res.status(200).json({ success: true, data: journal, message: "Journal updated successfully" });
  } catch (err) {
    console.error("Update journal error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- DELETE DAILY JOURNAL --------------------
export const deleteDailyJournal = async (req, res) => {
  const { enrollmentId, journalId } = req.params;
  const studentId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(enrollmentId) || !mongoose.Types.ObjectId.isValid(journalId)) {
    return res.status(400).json({ success: false, message: "Invalid ID" });
  }

  try {
    const enrollment = await ModuleEnrollment.findById(enrollmentId);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: "Enrollment not found" });
    }

    if (enrollment.student.toString() !== studentId) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (enrollment.passed) {
      return res.status(400).json({ success: false, message: "Cannot delete journal after passing module" });
    }

    const journal = enrollment.dailyJournals.id(journalId);
    if (!journal) {
      return res.status(404).json({ success: false, message: "Journal not found" });
    }

    if (!isWithin24Hours(journal.date)) {
      return res.status(400).json({ success: false, message: "Can only delete within 24 hours of submission" });
    }

    journal.remove();
    await enrollment.save();

    res.status(200).json({ success: true, message: "Journal deleted successfully" });
  } catch (err) {
    console.error("Delete journal error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const tutorJournalView = async (req, res) => {
    const { enrollmentId } = req.params;

    try {
      const enrollment = await ModuleEnrollment.findById(enrollmentId).populate("dailyJournals");
      if (!enrollment) {
        return res.status(404).json({ success: false, message: "Enrollment not found" });
      }

      res.status(200).json({
        success: true,
        data: enrollment.dailyJournals,
      });
    } catch (err) {
      console.error("Fetch student journals error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  }