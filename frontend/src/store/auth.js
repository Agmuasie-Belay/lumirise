import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      users: [],
      currentUser: null,

      setUsers: (users) => set({ users }),

      // SIGN UP
      signup: async (newUser) => {
        try {
          if (!newUser.name || !newUser.email || !newUser.password) {
            return { success: false, message: "Please provide all values" };
          }

          const res = await fetch("http://localhost:5000/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser),
          });

          const data = await res.json();
          if (!data.success) return { success: false, message: data.message };

          set((state) => ({ users: [...state.users, data.data] }));

          return { success: true, message: data.message };
        } catch (error) {
          console.error("Signup error:", error.message);
          return { success: false, message: "Signup failed" };
        }
      },

      // LOGIN
      login: async (credentials) => {
        if (!credentials.emailOrPhone || !credentials.password) {
          return {
            success: false,
            message: "Email or phone and password required",
          };
        }

        try {
          const res = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          const data = await res.json();

          if (!res.ok) {
            return { success: false, message: data.message || "Login failed" };
          }

          set({ currentUser: data.user });

          localStorage.setItem("token", data.token);

          return { success: true, message: "Login successful", user: data.user };
        } catch (error) {
          console.error("Login error:", error.message);
          return { success: false, message: "Login failed" };
        }
      },

      // LOGOUT
      logout: async () => {

        set({ currentUser: null });
        localStorage.removeItem("token");

        return { success: true, message: "Logout successful" };
      },

      // -------------------------
      // PASSWORD RESET 
      // -------------------------

      sendPasswordResetEmail: async (email) => {
        try {
          if (!email) return { success: false, message: "Email is required" };

          const res = await fetch(
            "http://localhost:5000/api/auth/send-reset-email",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            }
          );

          const data = await res.json();
          if (!res.ok)
            return {
              success: false,
              message: data.message || "Failed to send email",
            };

          return {
            success: true,
            message:
              data.message || "Password reset email sent successfully",
          };
        } catch (error) {
          console.error("Reset email error:", error.message);
          return { success: false, message: "Error sending reset email" };
        }
      },

      requestPasswordReset: async (email) => {
        return await get().sendPasswordResetEmail(email);
      },

      resetPassword: async (token, newPassword) => {
        try {
          const res = await fetch(
            `http://localhost:5000/api/auth/reset-password/${token}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ password: newPassword }),
            }
          );

          const data = await res.json();

          if (!res.ok) {
            return {
              success: false,
              message: data.message || "Password reset failed",
            };
          }

          return {
            success: true,
            message: data.message || "Password successfully reset",
          };
        } catch (error) {
          console.error("Reset password error:", error.message);
          return { success: false, message: "Error resetting password" };
        }
      },
    }),

    // -------------------------
    // ZUSTAND PERSIST CONFIG
    // -------------------------
    {
      name: "auth-storage", 
      partialize: (state) => ({
        currentUser: state.currentUser,
        users: state.users, 
      }),
    }
  )
);
