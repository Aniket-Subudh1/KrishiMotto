import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { usePersistHydrated } from '@/hooks/use-persist-hydrated';
import { syncAuthCompletionState } from '@/lib/auth-routing';
import { clearLocalSession, setSessionExpiredHandler } from '@/lib/auth-session';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

/** Validates persisted tokens on launch and redirects when the session is invalid. */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  const hydrated = usePersistHydrated();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const validatedRef = useRef(false);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      router.replace('/get-started');
    });

    return () => setSessionExpiredHandler(null);
  }, []);

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user) {
      validatedRef.current = false;
      return;
    }

    if (validatedRef.current) {
      return;
    }

    validatedRef.current = true;

    authService
      .me()
      .then(async ({ data }) => {
        updateUser(data.data);
        await syncAuthCompletionState(data.data);
      })
      .catch(async () => {
        await clearLocalSession();
        router.replace('/get-started');
      });
  }, [hydrated, isAuthenticated, updateUser, user]);

  return children;
}
