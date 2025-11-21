import { create } from "zustand";
import { apiFetch } from "./api";
const API_URL = process.env.REACT_APP_API_URL;
export const useModuleStore = create((set, get) => ({
  modules: [],
  setModules: (modules) => set({ modules }),

  // -------------------------
  // Create a new module
  // -------------------------
 createModule: async (newModule) => {
  try {
    const userRole = JSON.parse(localStorage.getItem("role"));
    const token = localStorage.getItem("token");

    if (userRole !== "tutor") {
      return { success: false, message: "Only tutors can create modules" };
    }

    const { title, description } = newModule;
    if (!title || !description) {
      return { success: false, message: "Please provide all required fields: title, description" };
    }
    console.log(newModule.tasks)

    // Clean arrays and ensure MCQs are well-structured
    // const moduleToSend = {
    //   ...newModule,
    //   objectives: newModule.objectives?.map((o) => o.trim()).filter(Boolean) || [],
    //   videoLinks: newModule.videoLinks?.map((v) => v.trim()).filter(Boolean) || [],
    //   readingFileLinks: newModule.readingFileLinks?.map((r) => r.trim()).filter(Boolean) || [],
    //   tasks: newModule.tasks?.map((t) => t.trim()).filter(Boolean) || [],
    //   mcqs: newModule.mcqs?.map((m) => ({
    //     question: m.question?.trim() || "",
    //     options: m.options?.map((o) => o.trim()).filter(Boolean) || [],
    //     answer: m.answer?.trim() || "",
    //   })) || [],
    //   status: "Draft", // default status
    // };
    // =============================================
// CLEAN + MODEL-COMPLIANT MODULE BUILDER
// =============================================
const safeTrim = (value) =>
  typeof value === "string" ? value.trim() : value;

// Build lessons safely
const cleanedLessons = Array.isArray(newModule.lessons)
  ? newModule.lessons.map((lesson, index) => ({
      title: safeTrim(lesson.title) || "",
      body: safeTrim(lesson.body) || "",
      order: lesson.order ?? index + 1,

      videoLinks: Array.isArray(lesson.videoLinks)
        ? lesson.videoLinks.map(safeTrim).filter(Boolean)
        : [],

      readingFiles: Array.isArray(lesson.readingFiles)
        ? lesson.readingFiles.map(safeTrim).filter(Boolean)
        : [],

      // ---------------------
      // TASKS INSIDE LESSON
      // ---------------------
      tasks: Array.isArray(lesson.tasks)
        ? lesson.tasks.map((t, ti) => ({
            title: safeTrim(t.title) || "",
            description: safeTrim(t.description) || "",
            required: t.required ?? true,
            estimatedTime: t.estimatedTime ?? null,
            order: t.order ?? ti + 1,
          }))
        : [],

      // ---------------------
      // MCQs INSIDE LESSON
      // ---------------------
      mcqs: Array.isArray(lesson.mcqs)
        ? lesson.mcqs.map((m, mi) => ({
            question: safeTrim(m.question) || "",
            options: Array.isArray(m.options)
              ? m.options.map(safeTrim).filter(Boolean)
              : [],
            correctAnswer: safeTrim(m.correctAnswer) || "",
            order: m.order ?? mi + 1,
          }))
        : [],
    }))
  : [];

// =============================================
// FINAL CLEAN MODULE OBJECT TO SEND TO API
// =============================================
const moduleToSend = {
  title: safeTrim(newModule.title),
  description: safeTrim(newModule.description),

  objectives: Array.isArray(newModule.objectives)
    ? newModule.objectives.map(safeTrim).filter(Boolean)
    : [],

  tutor: newModule.tutor, 

  lessons: cleanedLessons,

  hourlyRate: newModule.hourlyRate ?? null,
  category: safeTrim(newModule.category) || "",
  difficulty: newModule.difficulty || "beginner",

  tags: Array.isArray(newModule.tags)
    ? newModule.tags.map(safeTrim).filter(Boolean)
    : [],

  startDate: newModule.startDate || null,
  endDate: newModule.endDate || null,

  status: "Draft",
};


    const data = await apiFetch(`${API_URL}/api/modules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(moduleToSend),
    });

    if (!data.success) {
      return { success: false, message: data.message || "Failed to create module" };
    }

    set((state) => ({ modules: [...state.modules, data.data] }));

    return { success: true, message: "Module created successfully", data: data.data };
  } catch (error) {
    console.error("Error creating module:", error);
    return { success: false, message: error.message || "Failed to create module" };
  }
},


  // -------------------------
  // Fetch modules
  // -------------------------
 fetchModules: async () => {
  try {
    const data = await apiFetch(`${API_URL}/api/modules`);
    const userRole = JSON.parse(localStorage.getItem("role"));
    const userId = JSON.parse(localStorage.getItem("user"))?.id;

    let filteredModules = data.data;

    if (userRole === "student") {
      // Students see only approved/published modules
      filteredModules = filteredModules.filter((m) => m.status === "Published");
    } else if (userRole === "tutor") {
      // Tutors see all modules they created
      filteredModules = filteredModules.filter((m) => m.tutor?._id === userId);
    } else if (userRole === "admin") {
      // Admins see only pending or approved modules
      filteredModules = filteredModules.filter(
        (m) => m.status === "Pending" || m.status === "Published"
      );
    }

    set({ modules: filteredModules });
  } catch (error) {
    console.error("Fetch modules error:", error.message);
  }
},


  // -------------------------
  // Delete module (Tutor)
  // -------------------------
  deleteModule: async (module_id) => {
    try {
      const data = await apiFetch(`${API_URL}/api/modules/${module_id}`, { method: "DELETE" });
      set((state) => ({ modules: state.modules.filter((m) => m._id !== module_id) }));
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // -------------------------
  // Update module (Tutor)
  // -------------------------
  updateModule: async (module_id, updatedModule) => {
    try {
      const data = await apiFetch(`${API_URL}/api/modules/${module_id}`, {
        method: "PUT",
        body: JSON.stringify(updatedModule),
      });
      set((state) => ({
        modules: state.modules.map((m) => (m._id === module_id ? data.data : m)),
      }));
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // -------------------------
  // Enroll student in module
  // -------------------------
  enrollModule: async (module_id) => {
    try {
      const data = await apiFetch(`${API_URL}/api/modules/${module_id}/enroll`, { method: "POST" });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // -------------------------
  // Record student progress
  // -------------------------
  recordActivity: async (module_id, progress) => {
    try {
      const data = await apiFetch(`${API_URL}/api/modules/${module_id}/progress`, {
        method: "PUT",
        body: JSON.stringify({ progress }),
      });

      set((state) => ({
        modules: state.modules.map((m) => (m._id === module_id ? { ...m, progress } : m)),
      }));

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // -------------------------
  // Tutor feedback per student per module
  // -------------------------
  giveFeedback: async (module_id, payload) => {
    try {
      const data = await apiFetch(`${API_URL}/api/modules/${module_id}/feedback`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id ? { ...m, feedback: [...(m.feedback || []), data.data] } : m
        ),
      }));

      return { success: true, message: "Feedback submitted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // -------------------------
  // Admin approval actions
  // -------------------------
  approveModule: async (module_id) => {
    try {
      const data = await apiFetch(`${API_URL}/api/modules/${module_id}/approve`, { method: "PUT" });
      set((state) => ({
        modules: state.modules.map((m) => (m._id === module_id ? { ...m, status: "approved" } : m)),
      }));
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  rejectModule: async (module_id) => {
    try {
      const data = await apiFetch(`${API_URL}/api/modules/${module_id}/reject`, { method: "PUT" });
      set((state) => ({
        modules: state.modules.map((m) => (m._id === module_id ? { ...m, status: "rejected" } : m)),
      }));
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
  // -------------------------
// Tutor requests approval
// -------------------------
requestApproval: async (module_id) => {
  try {
    const data = await apiFetch(`${API_URL}/api/modules/${module_id}/request-approval`, { method: "PUT" });
    set((state) => ({
      modules: state.modules.map((m) => 
        m._id === module_id ? { ...m, status: "Pending" } : m
      ),
    }));
    return { success: true, message: data.message };
  } catch (error) {
    return { success: false, message: error.message };
  }
},

}));


