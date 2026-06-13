import { queryClient } from '@/lib/query-client';

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired() {
  sessionExpiredHandler?.();
}

/** Clears all auth state from memory, persisted storage, and the query cache. */
export async function clearLocalSession(): Promise<void> {
  const { useAuthStore } = await import('@/stores/auth.store');
  const { useAuthFlowStore } = await import('@/stores/auth-flow.store');

  useAuthStore.getState().clearAuth();
  useAuthFlowStore.getState().clearAuthFlow();

  await Promise.all([
    useAuthStore.persist.clearStorage(),
    useAuthFlowStore.persist.clearStorage(),
  ]);

  queryClient.clear();
}

/** Clears the local session and notifies listeners (e.g. redirect to sign-in). */
export async function forceLogout(): Promise<void> {
  await clearLocalSession();
  notifySessionExpired();
}
