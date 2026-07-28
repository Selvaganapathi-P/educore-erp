import { create } from 'zustand';
import api from '../lib/axios';

const stored = () => {
  try {
    return { user: JSON.parse(localStorage.getItem('user')), token: localStorage.getItem('token') };
  } catch { return { user: null, token: null }; }
};

export const useAuthStore = create((set) => ({
  user:    stored().user,
  token:   stored().token,
  student: null,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user, token, studentProfile } = data.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ user, token, student: studentProfile || null });
    return user;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* silent */ }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, student: null });
  },

  setStudent: (s) => set({ student: s }),
}));
