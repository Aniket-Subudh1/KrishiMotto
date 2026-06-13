import { queryClient } from '@/lib/query-client';

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired() {
  sessionExpiredHandler?.();
}

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

export async function forceLogout(): Promise<void> {
  await clearLocalSession();
  notifySessionExpired();
}
