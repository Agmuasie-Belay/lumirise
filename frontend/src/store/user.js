import { create } from "zustand";
const API_URL = process.env.REACT_APP_API_URL;
export const useUserStore = create((set) => ({
  users: [],
  currentUser: null,

  setUsers: (users) => set({ users }),

  fetchUsers: async () => {
    const res = await fetch(`${API_URL}/api/users`);
    const data = await res.json();
    set({ users: data.data });
  },

  deleteUser: async (user_id) => {
    const res = await fetch(`${API_URL}/api/users/${user_id}`, {
      method: "DELETE",
    });

    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };

    set((state) => ({
      users: state.users.filter((user) => user._id !== user_id),
    }));
    return { success: true, message: data.message };
  },

  updateUser: async (user_id, updatedUser) => {
    const res = await fetch(`${API_URL}/api/users/${user_id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedUser),
    });

    const data = await res.json();
    if (!data.success) return { success: false, message: data.message };

    set((state) => ({
      users: state.users.map((user) =>
        user._id === user_id ? data.user : user
      ),
    }));
    return { success: true, message: data.message };
  },
}));
