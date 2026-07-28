import { create } from 'zustand';
import api from '../lib/axios';

const get = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));
const drop = (key) => localStorage.removeItem(key);

export const useAuthStore = create((set, getState) => ({
  user:    get('user'),
  token:   localStorage.getItem('token'),
  student: get('student'),   // persisted now
  loading: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user, token, studentProfile } = data.data;
    localStorage.setItem('token', token);
    save('user', user);
    save('student', studentProfile ?? null);
    set({ user, token, student: studentProfile ?? null });
    return user;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* silent */ }
    drop('token'); drop('user'); drop('student');
    set({ user: null, token: null, student: null });
  },

  // Call on mount to refresh user + student (handles page reload for student role)
  refreshAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    set({ loading: true });
    try {
      const { data } = await api.get('/auth/me');
      const { user, studentProfile } = data.data;
      save('user', user);
      save('student', studentProfile ?? null);
      set({ user, student: studentProfile ?? null });
    } catch {
      // Token expired — clear everything
      drop('token'); drop('user'); drop('student');
      set({ user: null, token: null, student: null });
    } finally {
      set({ loading: false });
    }
  },

  setStudent: (s) => { save('student', s); set({ student: s }); },
}));
