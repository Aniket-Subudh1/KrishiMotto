import { useMutation, useQuery } from '@tanstack/react-query';

import { queryClient } from '@/lib/query-client';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginPayload, RegisterPayload, RequestOtpPayload } from '@/types/auth';

export const AUTH_KEYS = {
  me: ['auth', 'me'] as const,
};

export function useRequestOtp() {
  return useMutation({
    mutationFn: (payload: RequestOtpPayload) => authService.requestOtp(payload),
  });
}

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: ({ data }) => {
      const { user, token, refreshToken } = data.data;
      setAuth(user, token, refreshToken);
    },
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: ({ data }) => {
      const { user, token, refreshToken } = data.data;
      setAuth(user, token, refreshToken);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

/** Fetch current user profile. Only runs when authenticated. */
export function useMe() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: AUTH_KEYS.me,
    queryFn: () => authService.me(),
    enabled: isAuthenticated,
    select: (res) => res.data.data,
  });
}
