import { Redirect } from 'expo-router';

import { getAuthRedirectHref } from '@/lib/auth-routing';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';

/** Redirects authenticated users to the correct screen based on role and onboarding state. */
export function AuthRedirect() {
  const user = useAuthStore((s) => s.user);
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const signupStep = useAuthFlowStore((s) => s.signupStep);

  return <Redirect href={getAuthRedirectHref(user, profileCompleted, signupStep)} />;
}
