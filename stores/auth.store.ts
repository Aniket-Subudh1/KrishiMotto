import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthUser } from '@/types/auth';

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  profileCompleted: boolean;
  setAuth: (user: AuthUser, token: string, refreshToken: string) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  setToken: (token: string) => void;
  setRefreshToken: (refreshToken: string) => void;
  setProfileCompleted: (completed: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      profileCompleted: false,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken, isAuthenticated: true }),

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),

      setToken: (token) => set({ token }),

      setRefreshToken: (refreshToken) => set({ refreshToken }),

      setProfileCompleted: (profileCompleted) => set({ profileCompleted }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          profileCompleted: false,
        }),
    }),
    {
      name: 'krishimotto-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        profileCompleted: state.profileCompleted,
      }),
    },
  ),
);
