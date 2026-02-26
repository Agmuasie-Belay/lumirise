import { create } from "zustand";
import { apiFetch } from "./api";
const API_URL = import.meta.env.VITE_API_URL;

export const useEnrollmentStore = create((set, get) => ({
  enrollments: [],
  tasks:null,
  currentEnrollment: null,
  loading: false,
  quizStates: {},

  // Enroll student in module
  enrollInModule: async (moduleId) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/enrollments/enroll/${moduleId}`,
        {
          method: "POST",
        },
      );

      if (!data.success) {
        return { success: false, message: data.message };
      }

      const newEnrollment = data.data;

      set((state) => ({
        enrollments: [...state.enrollments, newEnrollment],
      }));

      return { success: true, enrollment: newEnrollment };
    } catch (error) {
      console.error("Enrollment failed:", error.message);
      return { success: false, message: error.message };
    }
  },

  fetchStudentEnrollments: async () => {
    try {
      set({ loading: true });
      const data = await apiFetch(`${API_URL}/api/enrollments/student`);
      set({ enrollments: data || [], loading: false });
      return data.data;
    } catch (err) {
      console.error("Fetch student enrollments error:", err);
      set({ loading: false });
      return [];
    }
  },

  fetchTask: async (enrollmentId, taskId) => {
    try {
      set({ loading: true });
      const data = await apiFetch(`${API_URL}/api/enrollments/${enrollmentId}/task/${taskId}`);
      set({ tasks: data || [], loading: false });
      return data;
    } catch (err) {
      console.error("Fetch student enrollments error:", err);
      set({ loading: false });
      return [];
    }
  },

  fetchEnrollment: async (moduleId) => {
    try {
      const response = await apiFetch(
        `${API_URL}/api/enrollments/enrollment/${moduleId}`,
      );

      if (!response.success) {
        console.error("Failed to fetch enrollment:", response.message);
        return null;
      }

      // Make sure you grab the enrollment object
      const enrollment = Array.isArray(response.data)
        ? response.data[0] // if API returns array
        : response.data;

      // Update Zustand store
      set({ currentEnrollment: enrollment });

      return enrollment; // return for immediate use
    } catch (err) {
      console.error("Failed to fetch enrollment:", err.message);
      return null;
    }
  },

  checkEnrollment: async (moduleId) => {
    try {
      set({ loading: true });
      const data = await apiFetch(
        `${API_URL}/api/enrollments/student/${moduleId}/status`,
      );
      set({ loading: false });
      return {
        enrolled: data.enrolled || false,
        enrollmentId: data.enrollmentId || null,
        progressPercent: data.progressPercent || 0,
      };
    } catch (err) {
      console.error("Check enrollment error:", err);
      set({ loading: false });
      return { enrolled: false, enrollmentId: null };
    }
  },

  submitMCQ: async (enrollmentId, blockId, answers) => {
    try {
      const token = localStorage.getItem("token");

      const formattedAnswers = answers.map((ans, qIndex) => ({
        questionIndex: qIndex,
        selected: ans,
      }));
      const data = await apiFetch(
        `${API_URL}/api/enrollments/${enrollmentId}/quiz`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ blockId, answers: formattedAnswers }),
        },
      );

      if (!data.success) {
        return { success: false, message: data.message };
      }

      // Update enrollments in store
      set((state) => {
        const updatedEnrollments = state.enrollments.map((e) =>
          e._id === enrollmentId
            ? {
                ...e,
                progressPercent: data.progressPercent,
                quizAttempts: {
                  ...(e.quizAttempts || {}),
                  [blockId]: data.allAttempts || [],
                },
                completedBlocks: data.isPassed
                  ? e.completedBlocks?.includes(blockId)
                    ? e.completedBlocks
                    : [...(e.completedBlocks || []), blockId]
                  : e.completedBlocks,
              }
            : e,
        );

        return {
          enrollments: updatedEnrollments,
          currentEnrollment:
            state.currentEnrollment?._id === enrollmentId
              ? updatedEnrollments.find((e) => e._id === enrollmentId)
              : state.currentEnrollment,
        };
      });

      return {
        success: true,
        score: data.score,
        highestScore: data.highestScore,
        attemptsRemaining: data.attemptsRemaining,
        isPassed: data.isPassed,
      };
    } catch (err) {
      console.error("Submit MCQ error:", err);
      return { success: false, message: err.message };
    }
  },

  fetchQuizState: async (enrollmentId, blockId) => {
    try {
      const res = await apiFetch(
        `${API_URL}/api/enrollments/${enrollmentId}/quiz/${blockId}`,
      );
      if (!res.success) throw new Error("Failed to fetch quiz state");

      set((state) => ({
        quizStates: {
          ...state.quizStates,
          [blockId]: res,
        },
      }));

      return res;
    } catch (err) {
      console.error("Fetch quiz state error:", err);
      return null;
    }
  },
  getQuizState: (blockId) => {
    const state = useEnrollmentStore.getState();
    const quiz = state.quizStates?.[blockId];
    if (!quiz) {
      return {
        attemptsUsed: 0,
        attemptsRemaining: 3,
        lastScore: null,
        highestScore: null,
        isPassed: false,
        isLocked: false,
      };
    }

    const isLocked = quiz.attemptsRemaining <= 0 || quiz.isPassed;

    return {
      ...quiz,
      isLocked,
    };
  },

  // Submit tutor-graded task
  submitTask: async (enrollmentId, taskId, submission, type) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/enrollments/${enrollmentId}/task/${taskId}/submit`,
        {
          method: "POST",
          body: JSON.stringify({ submission, type }),
        },
      );

      if (!data.success) {
        return data;
      }

      set((state) => ({
        enrollments: state.enrollments.map((enrollment) => {
          if (String(enrollment._id) !== String(enrollmentId)) {
            return enrollment;
          }

          return {
            ...enrollment,
            taskSubmissions: {
              ...enrollment.taskSubmissions,
              [taskId]: {
                submission: {
                  value: submission,
                  type: type,
                },
                status: "pending",
                attemptCount:
                  (enrollment.taskSubmissions?.[taskId]?.attemptCount || 0) + 1,
                score: null,
                feedback: "",
              },
            },
          };
        }),
      }));

      return data;
    } catch (err) {
      console.error("Submit task error:", err);
      return { success: false, message: err.message };
    }
  },

  // -------------------------
  // Tutor: fetch all students for tutor
  // GET /enrollment/tutor
  // -------------------------
  fetchTutorStudents: async () => {
    try {
      set({ loading: true });
      const data = await apiFetch(`${API_URL}/api/enrollments/tutor`);
      set({ enrollments: data.data || [], loading: false });
      return data.data;
    } catch (err) {
      console.error("Fetch tutor students error:", err);
      set({ loading: false });
      return [];
    }
  },

  // -------------------------
  // Tutor: update progress manually
  // PUT /enrollment/progress/:enrollmentId
  // -------------------------
  updateProgress: async (enrollmentId, progressPercent) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/enrollment/progress/${enrollmentId}`,
        {
          method: "PUT",
          body: JSON.stringify({ progressPercent }),
        },
      );

      if (data.success) {
        set((state) => ({
          enrollments: state.enrollments.map((e) =>
            e.enrollmentId === enrollmentId
              ? { ...e, progressPercent: data.data.progressPercent }
              : e,
          ),
        }));
      }
      return data;
    } catch (err) {
      console.error("Update progress error:", err);
      return { success: false, message: err.message };
    }
  },

  // -------------------------
  // Utility: get enrollment by moduleId
  // -------------------------
  getEnrollmentByModule: (moduleId) => {
    const enrollment = get().enrollments.find((e) => e.moduleId === moduleId);
    return enrollment || null;
  },

  // Record student progress
  // -------------------------
  recordActivity: async (moduleId, blockId) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/enrollments/${moduleId}/activity`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ blockId }),
        },
      );

      if (!data.success) {
        return { success: false, message: data.message };
      }

      set((state) => ({
        enrollments: Array.isArray(state.enrollments)
          ? state.enrollments.map((e) =>
              e.module?.toString() === moduleId.toString()
                ? {
                    ...e,
                    progressPercent: data.progressPercent,
                    completedBlocks: Array.isArray(e.completedBlocks)
                      ? e.completedBlocks.includes(blockId)
                        ? e.completedBlocks
                        : [...e.completedBlocks, blockId]
                      : [blockId],
                  }
                : e,
            )
          : [],
      }));

      return {
        success: true,
        message: data.message,
        progressPercent: data.progressPercent,
        completedBlocks: data.completedBlocks,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // -------------------------
  // Tutor feedback per student per module
  // -------------------------
  giveFeedback: async (module_id, payload) => {
    try {
      const data = await apiFetch(
        `${API_URL}/api/modules/${module_id}/feedback`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );

      set((state) => ({
        modules: state.modules.map((m) =>
          m._id === module_id
            ? { ...m, feedback: [...(m.feedback || []), data.data] }
            : m,
        ),
      }));

      return { success: true, message: "Feedback submitted successfully" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  reviewTask: async (enrollmentId, taskId, payload) => {
  try {
    const data = await apiFetch(
      `${API_URL}/api/enrollments/${enrollmentId}/task/${taskId}/review`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      }
    );

    if (!data.success) return data;

    set((state) => ({
      enrollments: state.enrollments.map((e) =>
        e._id === enrollmentId
          ? {
              ...e,
              progressPercent: data.progressPercent,
              finalScore: data.finalScore ?? e.finalScore,
            }
          : e
      ),
    }));

    return data;
  } catch (err) {
    return { success: false, message: err.message };
  }
},
}));

