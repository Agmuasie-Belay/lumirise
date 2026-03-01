import Module from "../models/module.model.js";
import mongoose from "mongoose";

const safeTrim = (v) => (typeof v === "string" ? v.trim() : v);

export const mapLessonsToSchema = (lessons = []) => {
  return lessons.map((lesson, lIdx) => ({
    title: safeTrim(lesson.title) || `Lesson ${lIdx + 1}`,
    order: lIdx + 1,
    blocks: (lesson.blocks || []).map((block, bIdx) => {
      const base = {
        type: block.type,
        title: safeTrim(block.title) || `${block.type} ${bIdx + 1}`,
        order: block.order || bIdx + 1,
      };

      switch (block.type) {
        case "markdown":
          return {
            ...base,
            content: safeTrim(block.body || ""),
          };

        case "video":
        case "ppt":
          return {
            ...base,
            content: { url: safeTrim(block.url || "") },
          };

        case "task":
          return {
            ...base,
            content: {
              instructions: safeTrim(block.description || ""),
              submissionType: "text",
              required: true,
            },
          };

        case "mcq":
          return {
            ...base,
            questions: (block.questions || []).map((q) => ({
              questionText: q.questionText,
              options: (q.options || []).map((o, i) => ({
                text: o,
                isCorrect: i === q.correctAnswerIndex,
              })),
              type: "mcq",
              maxScore: 1,
            })),
          };

        default:
          return base;
      }
    }),
  }));
};

export const createModule = async (req, res) => {
  if (req.user.role !== "tutor")
    return res.status(403).json({ success: false });

  const {
    title,
    description,
    objectives,
    difficulty,
    category,
    tags,
    lessons,
    bannerUrl,
  } = req.body;
  if (!title?.trim() || !description?.trim())
    return res
      .status(400)
      .json({ success: false, message: "Title and description required" });

  try {
    const module = await Module.create({
      tutor: req.user.id,
      title: title.trim(),
      description: description.trim(),
      objectives: objectives || [],
      difficulty,
      category,
      tags: tags || [],
      lessons: mapLessonsToSchema(lessons),
      bannerUrl: bannerUrl || "",
      status: "Draft",
      feedback: [],
      enrolledStudents: [],
      history: [],
      pendingEdit: { isRequested: false, updatedFields: {}, requestedAt: null },
      pendingAction: null,
    });
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(400)
        .json({ success: false, message: "Module title must be unique" });
    console.error(error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// GET ALL MODULES
export const getModules = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    const filter = {};
    if (role === "student") filter.status = "Published";
    else if (role === "tutor") filter.tutor = userId;

    const modules = await Module.find(filter).populate(
      "tutor",
      "name email role",
    );
    res.status(200).json({ success: true, data: modules });
  } catch (error) {
    console.error("Error fetching modules:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET MODULE BY ID
export const getModuleById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success: false, message: "Invalid ID" });

  try {
    let query = Module.findById(id).populate("tutor", "name email role");
    if (req.user.role === "student") {
      query = query.populate({ path: "lessons.blocks.questions" });
    }

    const module = await query;
    if (!module)
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });

    res.status(200).json({ success: true, data: module });
  } catch (error) {
    console.error("Error fetching module:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE MODULE (Tutor - Draft Only)
export const updateModule = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(400).json({ success: false });

  try {
    const module = await Module.findById(id);
    if (!module) return res.status(404).json({ success: false });
    if (module.tutor.toString() !== req.user.id)
      return res.status(403).json({ success: false });
    if (module.status !== "Draft")
      return res
        .status(400)
        .json({ success: false, message: "Only Draft modules can be edited" });

    // Map lessons to schema
    if (req.body.lessons)
      req.body.lessons = mapLessonsToSchema(req.body.lessons);

    Object.assign(module, req.body);
    module.history.push({
      action: "edit",
      performedBy: req.user.id,
      changes: req.body,
    });

    await module.save();
    res.status(200).json({ success: true, data: module });
  } catch (error) {
    console.error("Error updating module:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// REQUEST APPROVAL (Tutor)
export const requestApproval = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "tutor")
    return res.status(403).json({ success: false });

  try {
    const module = await Module.findById(id);
    if (!module) return res.status(404).json({ success: false });
    if (module.tutor.toString() !== req.user.id)
      return res.status(403).json({ success: false });
    if (module.status !== "Draft")
      return res
        .status(400)
        .json({
          success: false,
          message: "Only Draft modules can request approval",
        });

    module.status = "Pending";
    await module.save();

    res
      .status(200)
      .json({ success: true, message: "Approval requested", data: module });
  } catch (error) {
    console.error("Error requesting approval:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// APPROVE MODULE (Admin)
export const approveModule = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false });

  try {
    const module = await Module.findById(id);
    if (!module) return res.status(404).json({ success: false });
    if (module.status !== "Pending")
      return res
        .status(400)
        .json({ success: false, message: "Module not pending" });

    module.status = "Published";
    await module.save();

    res
      .status(200)
      .json({ success: true, message: "Module published", data: module });
  } catch (error) {
    console.error("Error approving module:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// REJECT MODULE (Admin)
export const rejectModule = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false });

  try {
    const module = await Module.findById(id);
    if (!module) return res.status(404).json({ success: false });
    if (module.status !== "Pending")
      return res
        .status(400)
        .json({ success: false, message: "Module not pending" });

    module.status = "Draft";
    await module.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Module reverted to Draft",
        data: module,
      });
  } catch (error) {
    console.error("Error rejecting module:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// REQUEST DELETE (Tutor)
export const requestDelete = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "tutor")
    return res.status(403).json({ success: false });

  try {
    const module = await Module.findById(id);
    if (!module) return res.status(404).json({ success: false });
    if (module.tutor.toString() !== req.user.id)
      return res.status(403).json({ success: false });
    if (module.status !== "Published")
      return res
        .status(400)
        .json({
          success: false,
          message: "Only Published modules can request deletion",
        });

    module.status = "Pending";
    module.pendingAction = "delete";
    await module.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Delete request submitted",
        data: module,
      });
  } catch (error) {
    console.error("Error requesting delete:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// APPROVE DELETE (Admin → ARCHIVE)
export const approveDeleteRequest = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false });

  try {
    const module = await Module.findById(id);
    if (!module) return res.status(404).json({ success: false });
    if (module.pendingAction !== "delete")
      return res
        .status(400)
        .json({ success: false, message: "No delete request pending" });

    module.status = "Archived";
    module.pendingAction = null;
    await module.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Module archived successfully",
        data: module,
      });
  } catch (error) {
    console.error("Error approving delete:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// REQUEST EDIT (Tutor)
export const requestEdit = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "tutor")
    return res
      .status(403)
      .json({ success: false, message: "Only tutors can request edits" });

  const updates = req.body;
  if (!updates || Object.keys(updates).length === 0)
    return res
      .status(400)
      .json({ success: false, message: "No changes provided" });

  try {
    const module = await Module.findById(id);
    if (!module)
      return res
        .status(404)
        .json({ success: false, message: "Module not found" });
    if (module.tutor.toString() !== req.user.id)
      return res.status(403).json({ success: false });
    if (module.status !== "Published")
      return res
        .status(400)
        .json({
          success: false,
          message: "Only Published modules can request edits",
        });

    // Map lessons to schema if they are part of the edit request
    if (updates.lessons) updates.lessons = mapLessonsToSchema(updates.lessons);

    module.pendingEdit = {
      isRequested: true,
      updatedFields: updates,
      requestedAt: new Date(),
    };

    module.history.push({
      action: "edit-request",
      performedBy: req.user.id,
      changes: updates,
    });

    await module.save();

    res.status(200).json({
      success: true,
      message: "Edit request submitted for admin approval",
      data: module,
    });
  } catch (error) {
    console.error("Error requesting edit:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// APPROVE EDIT REQUEST (Admin)
export const approveEditRequest = async (req, res) => {
  const { id } = req.params;
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false });

  try {
    const module = await Module.findById(id);
    if (!module) return res.status(404).json({ success: false });
    if (!module.pendingEdit?.isRequested)
      return res
        .status(400)
        .json({ success: false, message: "No edit request pending" });

    // Apply the updates (including schema-compliant lessons)
    const updates = module.pendingEdit.updatedFields;
    if (updates.lessons) updates.lessons = mapLessonsToSchema(updates.lessons);
    Object.assign(module, updates);

    // Reset pendingEdit
    module.pendingEdit = {
      isRequested: false,
      updatedFields: {},
      requestedAt: null,
    };

    module.history.push({
      action: "edit-approved",
      performedBy: module.tutor,
      approvedBy: req.user.id,
      changes: updates,
    });

    await module.save();

    res
      .status(200)
      .json({ success: true, message: "Edit request approved", data: module });
  } catch (error) {
    console.error("Error approving edit:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
