import { useCallback, useRef, useState } from 'react';

/**
 * Tracks pull-to-refresh UI separately from React Query background refetches
 * (e.g. refetchInterval polling), so RefreshControl only spins on user action.
 */
export function useManualRefresh(refreshFn: () => Promise<unknown> | void) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshRef = useRef(refreshFn);
  refreshRef.current = refreshFn;

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    void Promise.resolve(refreshRef.current()).finally(() => {
      setIsRefreshing(false);
    });
  }, []);

  return { isRefreshing, onRefresh };
}
