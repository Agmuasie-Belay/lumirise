import { create } from "zustand";
import { apiFetch } from "./api";
const API_URL = import.meta.env.VITE_API_URL;

export const useJournalStore = create((set, get) => ({
  journals: {}, 
  journalLoading: false,

fetchJournals: async (enrollmentId) => {
    try {
      set({ journalLoading: true });
      const data = await apiFetch(
        `${API_URL}/api/enrollments/${enrollmentId}/journals`
      );
      set((state) => ({
        journals: { ...state.journals, [enrollmentId]: data.data || [] },
        journalLoading: false,
      }));
      return data.data;
    } catch (err) {
      console.error("Fetch journals error:", err);
      set({ journalLoading: false });
      return [];
    }
  },

  // Add a new journal entry
  addJournal: async (enrollmentId, entry) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/enrollments/${enrollmentId}/journals`,
        {
          method: "POST",
          body: JSON.stringify(entry),
        }
      );

      if (!data.success) return data;

      set((state) => ({
        journals: {
          ...state.journals,
          [enrollmentId]: [
            ...(state.journals[enrollmentId] || []),
            data.data,
          ],
        },
      }));

      return data;
    } catch (err) {
      console.error("Add journal error:", err);
      return { success: false, message: err.message };
    }
  },

  // Update a journal entry
  updateJournal: async (enrollmentId, journalId, updatedEntry) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/enrollments/${enrollmentId}/journals/${journalId}`,
        {
          method: "PUT",
          body: JSON.stringify(updatedEntry),
        }
      );

      if (!data.success) return data;

      set((state) => ({
        journals: {
          ...state.journals,
          [enrollmentId]: state.journals[enrollmentId].map((j) =>
            j._id === journalId ? data.data : j
          ),
        },
      }));

      return data;
    } catch (err) {
      console.error("Update journal error:", err);
      return { success: false, message: err.message };
    }
  },

  // Delete a journal entry
  deleteJournal: async (enrollmentId, journalId) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/enrollments/${enrollmentId}/journals/${journalId}`,
        { method: "DELETE" }
      );

      if (!data.success) return data;

      set((state) => ({
        journals: {
          ...state.journals,
          [enrollmentId]: state.journals[enrollmentId].filter(
            (j) => j._id !== journalId
          ),
        },
      }));

      return data;
    } catch (err) {
      console.error("Delete journal error:", err);
      return { success: false, message: err.message };
    }
  },
}));

