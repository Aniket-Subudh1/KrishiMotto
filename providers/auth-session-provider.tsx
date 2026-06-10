import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { usePersistHydrated } from '@/hooks/use-persist-hydrated';
import { notifySessionExpired, setSessionExpiredHandler } from '@/lib/auth-session';
import { queryClient } from '@/lib/query-client';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

/** Validates persisted tokens on launch and redirects when the session is invalid. */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const hydrated = usePersistHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const updateUser = useAuthStore((s) => s.updateUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const validatedRef = useRef(false);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.clear();
      router.replace('/get-started');
    });

    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    if (!hydrated || !isAuthenticated) {
      validatedRef.current = false;
      return;
    }

    if (validatedRef.current) {
      return;
    }

    validatedRef.current = true;

    authService
      .me()
      .then(({ data }) => {
        updateUser(data.data);
      })
      .catch(() => {
        clearAuth();
        queryClient.clear();
        router.replace('/get-started');
      });
  }, [clearAuth, hydrated, isAuthenticated, updateUser]);

  return children;
}
