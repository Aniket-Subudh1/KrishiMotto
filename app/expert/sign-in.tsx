import { router, type Href } from 'expo-router';
import { useEffect } from 'react';

import { useAuthFlowStore } from '@/stores/auth-flow.store';

export default function ExpertSignInRedirect() {
  const markEnteredFromGetStarted = useAuthFlowStore((s) => s.markEnteredFromGetStarted);
  const setAuthIntent = useAuthFlowStore((s) => s.setAuthIntent);

  useEffect(() => {
    markEnteredFromGetStarted();
    setAuthIntent('sign-in');
    router.replace('/sign-in' as Href);
  }, [markEnteredFromGetStarted, setAuthIntent]);

  return null;
}
