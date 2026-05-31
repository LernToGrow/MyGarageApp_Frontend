import { create } from 'zustand';

const stored = () => {
  try {
    return JSON.parse(localStorage.getItem('admin_user'));
  } catch {
    return null;
  }
};

export const useAuthStore = create((set) => ({
  token: localStorage.getItem('admin_token') || null,
  user: stored(),

  login(token, user) {
    localStorage.setItem('admin_token', token);
    localStorage.setItem('admin_user', JSON.stringify(user));
    set({ token, user });
  },

  logout() {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({ token: null, user: null });
  },
}));
