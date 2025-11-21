import Module from "../models/module.model.js";
import ModuleEnrollment from "../models/enrollment.model.js";
import MentorshipSession from "../models/mentorshipsession.model.js"; // CRITICAL: Added for cascade deletion
import mongoose from "mongoose";

// ==========================
// 🧠 Helper: compute progress percent
// ==========================
const computeProgressPercent = (module, enrollment) => {
    const completedTasksCount = enrollment.completedTasks?.length || 0;
    const completedMcqsCount = enrollment.completedMCQs?.length || 0;

    const totalTasks = module.tasks?.length || 0;
    const totalMcqs = module.mcqs?.length || 0;
    const totalUnits = totalTasks + totalMcqs;

    if (totalUnits === 0) return 0;

    const completedUnits = completedTasksCount + completedMcqsCount;
    return Math.min(Math.round((completedUnits / totalUnits) * 100), 100);
};

// ==========================
// GET /modules
// ==========================
export const getModules = async (req, res) => {
    try {
        console.log("User Info:", req.user.id);
        const userId = req.user?.id;
        const role = req.user?.role;

        const filter = {};
        if (role === "student") {
            filter.status = "Published"; 
        } else if (role === "tutor") {
            filter.tutor = userId; 
        }
    
        const modules = await Module.find(filter)
            .populate("tutor", "name email role")
            .select("-enrolledStudents");

        let studentEnrollments = [];
        if (role === "student") {
            studentEnrollments = await ModuleEnrollment.find({ student: userId }).select("module progressPercent");
        }

        // Format modules with enrollment and feedback info
        const formattedModules = modules.map((mod) => {
            const modObj = mod.toObject({ getters: true, virtuals: true });

            // Enrollment info for students
            let progress = null;
            let isEnrolled = false;
            if (role === "student") {
                const enrollment = studentEnrollments.find(e => e.module.equals(mod._id));
                isEnrolled = !!enrollment;
                if (isEnrolled) progress = enrollment.progressPercent;
            }

            // Feedback visible to user
            let feedbackForUser = [];
            if (role === "student") {
                feedbackForUser = mod.feedback.filter(f => f.student.toString() === userId);
            } else if (["tutor", "admin"].includes(role)) {
                feedbackForUser = mod.feedback;
            }

            return {
                ...modObj,
                isEnrolled,
                progress,
                feedback: feedbackForUser,
            };
        });

        res.status(200).json({ success: true, data: formattedModules });
    } catch (error) {
        console.error("Error fetching modules:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// POST /modules  (tutor)
// ==========================
export const createModule = async (req, res) => {
    if (req.user.role !== "tutor") return res.status(403).json({ success: false, message: "Only tutors can create modules" });

    const {
        title, description, objectives, videoLinks,
        readingFileLinks, mcqs, tasks, difficulty, category, tags
    } = req.body;

    if (!title || !description) return res.status(400).json({ success: false, message: "Title and description are required" });

    try {
        const newModule = new Module({
            tutor: req.user.id,
            title,
            description,
            objectives: objectives || [],
            videoLinks: videoLinks || [],
            readingFileLinks: readingFileLinks || [],
            mcqs: mcqs || [],
            tasks: tasks || [],
            feedback: [],
            status: "Draft",
            difficulty,
            category,
            tags,
        });

        await newModule.save();
        res.status(201).json({ success: true, message: "Module created successfully", data: newModule });
    } catch (error) {
        console.error("Error creating module:", error.message);
        if (error.code === 11000) return res.status(400).json({ success: false, message: "Module title must be unique." });
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// PUT /modules/:id  (tutor)
// ==========================
export const updateModule = async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid module ID" });

    delete updateData.tutor;
    delete updateData.enrolledStudents;

    try {
        const module = await Module.findById(id);
        if (!module) return res.status(404).json({ success: false, message: "Module not found" });

        const isTutor = req.user.role === "tutor" && module.tutor.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (isTutor) {
            if (module.status === "Draft") {
                Object.assign(module, updateData);
                module.history.push({ action: "edit", performedBy: req.user.id, changes: updateData });
                await module.save();
                return res.status(200).json({ success: true, message: "Draft module updated successfully", data: module });
            } else if (module.status === "Published") {
                module.pendingEdit = { isRequested: true, updatedFields: updateData, requestedAt: new Date() };
                await module.save();
                return res.status(200).json({ success: true, message: "Edit request submitted for admin approval", data: module });
            }
        }

        if (isAdmin) return res.status(403).json({ success: false, message: "Admins cannot directly edit modules; use approve endpoints" });

        return res.status(403).json({ success: false, message: "Not authorized to update this module" });
    } catch (error) {
        console.error("Error updating module:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// DELETE /modules/:id  (tutor/admin)
// ==========================
export const deleteModule = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid module ID" });

    try {
        const module = await Module.findById(id);
        if (!module) return res.status(404).json({ success: false, message: "Module not found" });

        const isTutor = req.user.role === "tutor" && module.tutor.toString() === req.user.id;
        const isAdmin = req.user.role === "admin";

        if (isTutor) {
            if (module.status === "Draft") {
                await ModuleEnrollment.deleteMany({ module: id });
                await MentorshipSession.deleteMany({ module: id });
                await module.deleteOne();
                return res.status(200).json({ success: true, message: "Draft module deleted successfully" });
            } else if (module.status === "Published") {
                module.pendingDelete = { isRequested: true, requestedAt: new Date() };
                await module.save();
                return res.status(200).json({ success: true, message: "Delete request submitted for admin approval", data: module });
            }
        }

        if (isAdmin) {
            await ModuleEnrollment.deleteMany({ module: id });
            await MentorshipSession.deleteMany({ module: id });
            module.history.push({ action: "delete", performedBy: req.user.id, approvedBy: req.user.id });
            await module.deleteOne();
            return res.status(200).json({ success: true, message: "Module deleted by admin successfully" });
        }

        return res.status(403).json({ success: false, message: "Not authorized to delete this module" });
    } catch (error) {
        console.error("Error deleting module:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// POST /modules/:id/enroll (student)
// ==========================
export const enrollModule = async (req, res) => {
    const { id: moduleId } = req.params;
    const studentId = req.user.id;
    const { hourlyRate, expectedEndDate } = req.body;

    if (req.user.role !== "student") return res.status(403).json({ success: false, message: "Only students can enroll" });
    try {
        const module = await Module.findById(moduleId);
        if (!module) return res.status(404).json({ success: false, message: "Module not found" });
        if (module.status !== "Published") return res.status(400).json({ success: false, message: "Cannot enroll in a module that is not published." });

        const existingEnrollment = await ModuleEnrollment.findOne({ student: studentId, module: moduleId });
        if (existingEnrollment) return res.status(400).json({ success: false, message: "Already enrolled" });

        const enrollment = new ModuleEnrollment({
            student: studentId,
            module: moduleId,
            tutor: module.tutor,
            hourlyRate,
            expectedEndDate,
            progressPercent: 0,
        });

        await enrollment.save();

        if (!module.enrolledStudents.some(s => s.equals(studentId))) {
            module.enrolledStudents.push(studentId);
            await module.save();
        }

        res.status(200).json({ success: true, message: "Enrolled successfully", data: enrollment });
    } catch (error) {
        console.error("Error enrolling module:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// POST /modules/:moduleId/activity (student)
// ==========================
export const recordActivity = async (req, res) => {
    const { moduleId } = req.params;
    const studentId = req.user.id;
    const { type, itemId } = req.body;

    if (!["task", "mcq"].includes(type)) return res.status(400).json({ success: false, message: "Invalid activity type" });
    if (!mongoose.Types.ObjectId.isValid(moduleId)) return res.status(400).json({ success: false, message: "Invalid module ID" });

    try {
        const module = await Module.findById(moduleId).select("tasks mcqs");
        const enrollment = await ModuleEnrollment.findOne({ student: studentId, module: moduleId });

        if (!module) return res.status(404).json({ success: false, message: "Module not found" });
        if (!enrollment) return res.status(400).json({ success: false, message: "Student is not enrolled in this module" });

        let itemFound = false;
        let updateSuccessful = false;

        if (type === "task") {
            if (module.tasks.some(t => t._id.equals(itemId))) itemFound = true;
            if (itemFound && !enrollment.completedTasks.some(t => t.equals(itemId))) {
                enrollment.completedTasks.push(itemId);
                updateSuccessful = true;
            }
        } else if (type === "mcq") {
            if (module.mcqs.some(m => m._id.equals(itemId))) itemFound = true;
            if (itemFound && !enrollment.completedMCQs.some(m => m.equals(itemId))) {
                enrollment.completedMCQs.push(itemId);
                updateSuccessful = true;
            }
        }

        if (!itemFound) return res.status(404).json({ success: false, message: `${type} not found in the module` });
        if (!updateSuccessful) return res.status(200).json({ success: true, message: "Activity already recorded", progress: enrollment.progressPercent });

        enrollment.progressPercent = computeProgressPercent(module, enrollment);
        await enrollment.save();

        res.status(200).json({ success: true, message: "Activity recorded and progress updated", progress: enrollment.progressPercent });
    } catch (error) {
        console.error("Error recording activity:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// PUT /modules/:moduleId/progress (tutor/admin)
// ==========================
export const updateProgress = async (req, res) => {
    const { moduleId } = req.params;
    const { studentId, progressPercent } = req.body;

    if (!mongoose.Types.ObjectId.isValid(moduleId) || !mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ success: false, message: "Invalid module or student ID" });

    const newProgress = Number(progressPercent);
    if (isNaN(newProgress) || newProgress < 0 || newProgress > 100) return res.status(400).json({ success: false, message: "Progress must be 0-100" });

    try {
        const module = await Module.findById(moduleId).select("tutor");
        if (!module) return res.status(404).json({ success: false, message: "Module not found" });

        if (module.tutor.toString() !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ success: false, message: "Not authorized" });

        const enrollment = await ModuleEnrollment.findOneAndUpdate(
            { module: moduleId, student: studentId },
            { progressPercent: newProgress },
            { new: true }
        );

        if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment record not found" });

        res.status(200).json({ success: true, message: `Progress updated to ${newProgress}%`, data: enrollment.progressPercent });
    } catch (error) {
        console.error("Error updating progress:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// POST /modules/:moduleId/feedback (tutor/admin)
// ==========================
export const giveFeedback = async (req, res) => {
    const { moduleId } = req.params;
    const { studentId, feedbackText } = req.body;
    const tutorId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(moduleId) || !mongoose.Types.ObjectId.isValid(studentId)) return res.status(400).json({ success: false, message: "Invalid module or student ID" });
    if (!feedbackText || typeof feedbackText !== 'string' || feedbackText.trim().length === 0) return res.status(400).json({ success: false, message: "Feedback text is required" });

    try {
        const module = await Module.findById(moduleId);
        if (!module) return res.status(404).json({ success: false, message: "Module not found" });

        if (module.tutor.toString() !== tutorId && req.user.role !== 'admin') return res.status(403).json({ success: false, message: "Not authorized" });

        const existingFeedbackIndex = module.feedback.findIndex(f => f.student.toString() === studentId);

        const newFeedbackEntry = { student: studentId, tutor: tutorId, text: feedbackText, createdAt: new Date() };

        if (existingFeedbackIndex !== -1) {
            module.feedback[existingFeedbackIndex] = newFeedbackEntry;
            await module.save();
            res.status(200).json({ success: true, message: "Feedback updated", data: newFeedbackEntry });
        } else {
            module.feedback.push(newFeedbackEntry);
            await module.save();
            res.status(201).json({ success: true, message: "Feedback recorded", data: newFeedbackEntry });
        }
    } catch (error) {
        console.error("Error giving feedback:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// PUT /modules/:id/approve (admin)
// ==========================
export const approveModule = async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Only admins can approve modules" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid module ID" });

    try {
        const module = await Module.findById(id);
        if (!module) return res.status(404).json({ success: false, message: "Module not found" });

        module.status = "Published";
        await module.save();
        res.status(200).json({ success: true, message: "Module published successfully", data: module });
    } catch (error) {
        console.error("Error publishing module:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// PUT /modules/:id/reject (admin)
// ==========================
export const rejectModule = async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Only admins can reject modules" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid module ID" });

    try {
        const module = await Module.findById(id);
        if (!module) return res.status(404).json({ success: false, message: "Module not found" });

        module.status = "Draft";
        await module.save();
        res.status(200).json({ success: true, message: "Module status reverted to Draft", data: module });
    } catch (error) {
        console.error("Error rejecting module:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// PUT /modules/:id/approveEdit (admin)
// ==========================
export const approveEditRequest = async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Only admins can approve edit requests" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid module ID" });

    try {
        const module = await Module.findById(id);
        if (!module) return res.status(404).json({ success: false, message: "Module not found" });
        if (!module.pendingEdit?.isRequested) return res.status(400).json({ success: false, message: "No pending edit request found" });

        Object.assign(module, module.pendingEdit.updatedFields);
        module.history.push({
            action: "edit",
            performedBy: module.tutor,
            approvedBy: req.user.id,
            changes: module.pendingEdit.updatedFields
        });

        module.pendingEdit = { isRequested: false, updatedFields: {}, requestedAt: null };
        await module.save();
        res.status(200).json({ success: true, message: "Edit request approved and applied", data: module });
    } catch (error) {
        console.error("Error approving edit request:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==========================
// PUT /modules/:id/approveDelete (admin)
// ==========================
export const approveDeleteRequest = async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Only admins can approve delete requests" });
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid module ID" });

    try {
        const module = await Module.findById(id);
        if (!module) return res.status(404).json({ success: false, message: "Module not found" });
        if (!module.pendingDelete?.isRequested) return res.status(400).json({ success: false, message: "No pending delete request found" });

        await ModuleEnrollment.deleteMany({ module: id });
        await MentorshipSession.deleteMany({ module: id });
        module.history.push({ action: "delete", performedBy: module.tutor, approvedBy: req.user.id });
        await module.deleteOne();

        res.status(200).json({ success: true, message: "Delete request approved and module removed" });
    } catch (error) {
        console.error("Error approving delete request:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


export const requestApproval = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "tutor") return res.status(403).json({ success: false, message: "Only tutors can request approval" });
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid module ID" });

  try {
    const module = await Module.findById(id);
    if (!module) return res.status(404).json({ success: false, message: "Module not found" });
    if (module.status !== "Draft") return res.status(400).json({ success: false, message: "Only draft modules can request approval" });

    module.status = "Pending";
    module.pendingEdit = { isRequested: true, requestedAt: new Date() }; // optional: track request date
    await module.save();

    res.status(200).json({ success: true, message: "Approval requested successfully", data: module });
  } catch (error) {
    console.error("Error requesting approval:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};