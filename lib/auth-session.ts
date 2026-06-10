type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler;
}

export function notifySessionExpired() {
  sessionExpiredHandler?.();
}

export async function forceLogout() {
  const { useAuthStore } = await import('@/stores/auth.store');
  useAuthStore.getState().clearAuth();
  notifySessionExpired();
}
