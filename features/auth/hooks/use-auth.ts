import { useMutation, useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import { queryClient } from '@/lib/query-client';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { FarmerAuthenticatePayload, SendOtpPayload } from '@/types/auth';

export const AUTH_KEYS = {
  me: ['auth', 'me'] as const,
};

export function useSendOtp() {
  return useMutation({
    mutationFn: async (payload: SendOtpPayload) => {
      const { data } = await authService.sendOtp(payload);
      return data.response;
    },
  });
}

export function useAuthenticateFarmer() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (payload: FarmerAuthenticatePayload) => {
      const { data } = await authService.authenticateFarmer(payload);
      return data.response;
    },
    onSuccess: (response) => {
      setAuth(response.user, response.token, response.refreshToken);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.replace('/get-started');
    },
  });
}

export function useLogoutAll() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        await authService.logoutAll();
      }
    },
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      router.replace('/get-started');
    },
  });
}

/** Fetch current user profile. Only runs when authenticated. */
export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: async () => {
      const { data } = await authService.me();
      return data.data;
    },
    enabled: isAuthenticated,
  });
}
