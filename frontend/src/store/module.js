import { create } from "zustand";
import { apiFetch } from "./api";
const API_URL = import.meta.env.VITE_API_URL;

const safeTrim = (v) => (typeof v === "string" ? v.trim() : v);

export const useModuleStore = create((set, get) => ({
  modules: [],
  currentModule: null,

  setModules: (modules) => set({ modules }),
  setCurrentModule: (module) => set({ currentModule: module }),

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
        filteredModules = filteredModules.filter(
          (m) => m.status === "Published",
        );
      } else if (userRole === "tutor") {
        filteredModules = filteredModules.filter(
          (m) => m.tutor?._id === userId,
        );
      } else if (userRole === "admin") {
        filteredModules = filteredModules.filter(
          (m) => m.status === "Pending" || m.status === "Published",
        );
      }

      set({ modules: filteredModules });
    } catch (err) {
      console.error("Fetch modules error:", err.message);
    }
  },

  fetchModuleById: async (id) => {
    try {
      const data = await apiFetch(`${API_URL}/api/modules/${id}`);
      if (data.success) {
        set({ currentModule: data.data });
        return data.data;
      }
      console.log(currentModule);
      return null;
    } catch (err) {
      console.error("Fetch module by ID error:", err);
      return null;
    }
  },

  // -------------------------
  // Create module (Tutor)
  // -------------------------
  createModule: async (newModule) => {
    try {
      const tutorId = JSON.parse(localStorage.getItem("user"))?.id;
      const userRole = JSON.parse(localStorage.getItem("role"));
      const token = localStorage.getItem("token");


      if (userRole !== "tutor")
        return { success: false, message: "Only tutors can create modules" };

      const moduleToSend = {
        ...newModule,
        tutor: tutorId,
        lessons: newModule.lessons,
        objectives: (newModule.objectives || []).map(safeTrim).filter(Boolean),
        tags: (newModule.tags || []).map(safeTrim).filter(Boolean),
        enrolledStudents: [],
        bannerUrl: newModule.bannerUrl || "",
      };
      
      const data = await apiFetch(`${API_URL}/api/modules`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(moduleToSend),
      });

      if (!data.success)
        return {
          success: false,
          message: data.message || "Failed to create module",
        };

      set((state) => ({ modules: [...state.modules, data.data] }));

      return {
        success: true,
        message: "Module created successfully",
        data: data.data,
      };
    } catch (error) {
      console.error("Error creating module:", error);
      return {
        success: false,
        message: error.message || "Failed to create module",
      };
    }
  },

  // -------------------------
  // Update module (Tutor)
  // -------------------------
  updateModule: async (module_id, updatedModule) => {
    try {
      const moduleToSend = {
        ...updatedModule,
        lessons: updatedModule.lessons,
        objectives: (updatedModule.objectives || [])
          .map(safeTrim)
          .filter(Boolean),
        tags: (updatedModule.tags || []).map(safeTrim).filter(Boolean),
      };

      const data = await apiFetch(`${API_URL}/api/modules/${module_id}`, {
        method: "PUT",
        body: JSON.stringify(moduleToSend),
      });

      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id ? data.data : m,
        ),
      }));

      return { success: true, message: data.message, data: data.data };
    } catch (error) {
      console.error("Error updating module:", error);
      return { success: false, message: error.message };
    }
  },

  // -------------------------
  // Delete / archive module
  // -------------------------
  requestDelete: async (module_id) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/modules/${module_id}/request-delete`,
        { method: "PUT" },
      );
      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id
            ? { ...m, pendingAction: "delete", status: "Pending" }
            : m,
        ),
      }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  approveDelete: async (module_id) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/modules/${module_id}/approve-delete`,
        { method: "PUT" },
      );
      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id
            ? { ...m, pendingAction: null, status: "Archived" }
            : m,
        ),
      }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // -------------------------
  // Request / approve edit
  // -------------------------
  requestEdit: async (module_id, updates) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/modules/${module_id}/request-edit`,
        {
          method: "PUT",
          body: JSON.stringify(updates),
        },
      );
      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id
            ? {
                ...m,
                pendingEdit: { isRequested: true, updatedFields: updates },
              }
            : m,
        ),
      }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  approveEdit: async (module_id) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/modules/${module_id}/approve-edit`,
        { method: "PUT" },
      );
      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id
            ? {
                ...m,
                pendingEdit: { isRequested: false, updatedFields: {} },
                ...data.data,
              }
            : m,
        ),
      }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // -------------------------
  // Approval / reject (admin)
  // -------------------------
  approveModule: async (module_id) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/modules/${module_id}/approve`,
        { method: "PUT" },
      );
      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id ? { ...m, status: "Published" } : m,
        ),
      }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  rejectModule: async (module_id) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/modules/${module_id}/reject`,
        { method: "PUT" },
      );
      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id ? { ...m, status: "Draft" } : m,
        ),
      }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  // -------------------------
  // Request approval (Tutor)
  // -------------------------
  requestApproval: async (module_id) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/modules/${module_id}/request-approval`,
        { method: "PUT" },
      );
      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id ? { ...m, status: "Pending" } : m,
        ),
      }));
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },
}));
