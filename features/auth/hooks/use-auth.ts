import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { clearLocalSession } from '@/lib/auth-session';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

async function signOut(apiCall?: () => Promise<unknown>): Promise<void> {
  try {
    await apiCall?.();
  } catch {
    // Server revocation is best-effort; local session must always be cleared.
  }

  await clearLocalSession();
  router.replace('/get-started');
}

export function useLogout() {
  return useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      await signOut(refreshToken ? () => authService.logout(refreshToken) : undefined);
    },
  });
}

export function useLogoutAll() {
  return useMutation({
    mutationFn: async () => {
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      await signOut(isAuthenticated ? () => authService.logoutAll() : undefined);
    },
  });
}
