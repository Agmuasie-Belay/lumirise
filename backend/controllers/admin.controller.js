import User from "../models/user.model.js"; // Standardized model name casing
import Module from "../models/module.model.js"; // Standardized model name casing
import ModuleEnrollment from "../models/enrollment.model.js"; // Import for clean-up logic
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

/**
 * -------------------- GET ALL USERS --------------------
 * Admin can view all registered users (students, tutors, admins)
 */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-passwordHash"); // Use passwordHash field name
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error("Get all users error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * -------------------- GET USER BY ID --------------------
 * Fetch details of a specific user by ID
 */
export const getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: "Invalid user ID" });
        }

        const user = await User.findById(userId).select("-passwordHash").populate("enrolledModules", "title category");

        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Get user by ID error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * -------------------- CREATE USER --------------------
 * Admin can manually create a new user (e.g., tutor, student, or another admin)
 */
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required for manual creation" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already registered" });
        }
        
        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await User.create({ 
            name, 
            email, 
            passwordHash, // Use the hashed password
            role, 
            emailVerification: { verified: true },
            phoneVerification: { verified: true },
            canUploadDocuments: true,
        });
        
        const userResponse = newUser.toObject();
        delete userResponse.passwordHash;

        res.status(201).json({ success: true, data: userResponse });
    } catch (error) {
        console.error("Create user error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * -------------------- UPDATE USER --------------------
 * Admin can update user info or role
 */
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        if (updates.password) {
            updates.passwordHash = await bcrypt.hash(updates.password, 10);
            delete updates.password;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
            runValidators: true,
        }).select("-passwordHash"); // Exclude hash from response

        if (!updatedUser)
            return res.status(404).json({ success: false, message: "User not found" });

        res.status(200).json({ success: true, message: "User updated", data: updatedUser });
    } catch (error) {
        console.error("Update user error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * -------------------- DELETE USER --------------------
 * Admin can remove a user and cleans up related enrollments/module references.
 */
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // --- Data Integrity Cleanup ---

        // 1. Remove all records from the ModuleEnrollment collection where this user is the student OR the tutor.
        await ModuleEnrollment.deleteMany({ $or: [{ student: userId }, { tutor: userId }] });

        // 2. If the user is a student, remove them from the 'enrolledStudents' array in any Module document.
        if (user.role === "student") {
            await Module.updateMany(
                { enrolledStudents: userId },
                { $pull: { enrolledStudents: userId } }
            );
        }

        // 3. If the user is a tutor, clear the 'tutor' field in their associated modules
        if (user.role === "tutor") {
             // NOTE: Depending on business logic, you might want to delete the modules,
             // but here we just clear the tutor reference.
            await Module.updateMany(
                { tutor: userId },
                { $unset: { tutor: "" }, status: "Draft" } // Unlink tutor and set status to draft
            );
        }

        await user.deleteOne(); // Delete the user record

        res.status(200).json({ success: true, message: "User and all related data deleted successfully" });
    } catch (error) {
        console.error("Delete user error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * -------------------- GET PLATFORM REPORTS --------------------
 * Admin dashboard summary: total users, modules, tutors, and active enrollments
 */
export const getReports = async (req, res) => {
    try {
        // Count documents are efficient for simple counts
        const totalUsers = await User.countDocuments();
        const totalTutors = await User.countDocuments({ role: "tutor" });
        const totalStudents = await User.countDocuments({ role: "student" });
        const totalModules = await Module.countDocuments();

        // Calculate total enrollments from the ModuleEnrollment collection (more accurate)
        const totalEnrollments = await ModuleEnrollment.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalTutors,
                totalStudents,
                totalModules,
                totalEnrollments, // Use the direct count from ModuleEnrollment
            },
        });
    } catch (error) {
        console.error("Get reports error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};