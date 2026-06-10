import { useEffect, useState } from 'react';

import { useAuthStore } from '@/stores/auth.store';
import { useLocaleStore } from '@/stores/locale.store';
import { useOnboardingStore } from '@/stores/onboarding.store';

const HYDRATION_TIMEOUT_MS = 2000;

function areStoresHydrated() {
  return (
    useAuthStore.persist.hasHydrated() &&
    useOnboardingStore.persist.hasHydrated() &&
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
    const unsubOnboarding = useOnboardingStore.persist.onFinishHydration(check);
    const unsubLocale = useLocaleStore.persist.onFinishHydration(check);
    const timeout = setTimeout(() => setHydrated(true), HYDRATION_TIMEOUT_MS);

    return () => {
      unsubAuth();
      unsubOnboarding();
      unsubLocale();
      clearTimeout(timeout);
    };
  }, []);

  return hydrated;
}
