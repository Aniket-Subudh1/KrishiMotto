import { useEffect, useState } from 'react';

import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';
import { useLocaleStore } from '@/stores/locale.store';

const HYDRATION_TIMEOUT_MS = 2000;

function areStoresHydrated() {
  return (
    useAuthStore.persist.hasHydrated() &&
    useAuthFlowStore.persist.hasHydrated() &&
    useLocaleStore.persist.hasHydrated()
  );
}

/** Waits for persisted zustand stores to rehydrate before routing decisions. */
export function usePersistHydrated() {
  const [hydrated, setHydrated] = useState(areStoresHydrated);

  useEffect(() => {
    function check() {
      if (areStoresHydrated()) {
        setHydrated(true);
      }
    }

    check();

    const unsubAuth = useAuthStore.persist.onFinishHydration(check);
    const unsubAuthFlow = useAuthFlowStore.persist.onFinishHydration(check);
    const unsubLocale = useLocaleStore.persist.onFinishHydration(check);
    const timeout = setTimeout(() => setHydrated(true), HYDRATION_TIMEOUT_MS);

    return () => {
      unsubAuth();
      unsubAuthFlow();
      unsubLocale();
      clearTimeout(timeout);
    };
  }, []);

  return hydrated;
}
