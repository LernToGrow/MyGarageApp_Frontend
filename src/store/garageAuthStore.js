import { create } from 'zustand';

const stored = () => {
  try {
    return JSON.parse(localStorage.getItem('garage_user'));
  } catch {
    return null;
  }
};

export const useGarageAuthStore = create((set) => ({
  token: localStorage.getItem('garage_token') || null,
  user: stored(),

  login(token, user) {
    localStorage.setItem('garage_token', token);
    localStorage.setItem('garage_user', JSON.stringify(user));
    set({ token, user });
  },

  logout() {
    localStorage.removeItem('garage_token');
    localStorage.removeItem('garage_user');
    set({ token: null, user: null });
  },
}));
