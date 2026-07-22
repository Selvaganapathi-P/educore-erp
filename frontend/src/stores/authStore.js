import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/axios';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user:        null,
      accessToken: null,
      isLoading:   false,

      setAccessToken: (token) => set({ accessToken: token }),

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password, rememberMe });
          set({
            user:        data.data.user,
            accessToken: data.data.accessToken,
            isLoading:   false,
          });
          return data.data;
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try { await api.post('/auth/logout'); } catch { /* silent */ }
        set({ user: null, accessToken: null });
      },

      refreshMe: async () => {
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.data });
        } catch { /* expired — let interceptor handle */ }
      },

      // Helpers
      isAuthenticated: () => !!get().accessToken && !!get().user,
      hasRole:         (...roles) => roles.includes(get().user?.role),
      hasPermission:   (perm) => {
        const perms = get().user?.permissions || [];
        return perms.includes('*') || perms.includes(perm);
      },
    }),
    {
      name:    'educore-auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
    }
  )
);
