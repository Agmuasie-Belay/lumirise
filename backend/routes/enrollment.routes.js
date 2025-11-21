import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

import {authorizeRoles} from "../middlewares/roleMiddleware.js";
import { 
    getStudentEnrollments, 
    getTutorStudents,
    enrollStudent, // Added for POST
    updateProgress // Added for PUT
} from "../controllers/enrollment.controller.js";

const router = express.Router();

// -------------------- Student Enrollment Access --------------------
// GET /enrollment/student: Student fetches their list of enrollments
router.get("/student", protect, authorizeRoles("student"), getStudentEnrollments);

// POST /enrollment/enroll/:moduleId: Student enrolls in a specific module
router.post("/enroll/:moduleId", protect, authorizeRoles("student"), enrollStudent);


// -------------------- Tutor Access --------------------
// GET /enrollment/tutor: Tutor fetches a list of all their enrolled students
router.get("/tutor", protect, authorizeRoles("tutor"), getTutorStudents);

// PUT /enrollment/progress/:enrollmentId: Tutor manually updates progress for a specific enrollment
router.put("/progress/:enrollmentId", protect, authorizeRoles("tutor"), updateProgress);

export default router;