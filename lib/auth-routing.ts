import type { Href } from 'expo-router';

import {
  isExpertKycSubmitted,
  isExpertProfileComplete,
  isFarmerProfileComplete,
} from '@/lib/expert-profile';
import { expertService } from '@/services/expert.service';
import { farmerService } from '@/services/farmer.service';
import type { SignupStep } from '@/stores/auth-flow.store';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';
import type { AuthUser } from '@/types/auth';

export function getAuthRedirectHref(
  user: AuthUser | null,
  profileCompleted: boolean,
  signupStep: SignupStep,
): Href {
  if (!user) {
    return '/get-started' as Href;
  }

  if (user.role === 'FARMER') {
    if (signupStep === 'land') {
      return '/farmer/land-boundary' as Href;
    }

    if (!profileCompleted) {
      return '/farmer/sign-up' as Href;
    }
  }

  if (user.role === 'EXPERT') {
    if (signupStep === 'kyc' || !profileCompleted) {
      return '/expert/sign-up' as Href;
    }
  }

  return '/(tabs)' as Href;
}

export async function deriveAuthCompletion(
  user: AuthUser,
  currentSignupStep: SignupStep,
): Promise<{ profileCompleted: boolean; signupStep: SignupStep }> {
  if (user.role === 'FARMER') {
    try {
      const { data } = await farmerService.getProfile();
      const profile = data.data;

      if (currentSignupStep === 'land') {
        return { profileCompleted: false, signupStep: 'land' };
      }

      const complete = isFarmerProfileComplete(profile);
      return {
        profileCompleted: complete,
        signupStep: complete ? 'complete' : 'profile',
      };
    } catch {
      return {
        profileCompleted: false,
        signupStep: currentSignupStep === 'land' ? 'land' : 'profile',
      };
    }
  }

  if (user.role === 'EXPERT') {
    try {
      const { data } = await expertService.getProfile();
      const profile = data.data;
      const profileComplete = isExpertProfileComplete(profile);
      const kycSubmitted = isExpertKycSubmitted(profile);

      if (!profileComplete) {
        return { profileCompleted: false, signupStep: 'profile' };
      }

      if (!kycSubmitted) {
        return { profileCompleted: false, signupStep: 'kyc' };
      }

      return { profileCompleted: true, signupStep: 'complete' };
    } catch {
      return {
        profileCompleted: false,
        signupStep: currentSignupStep === 'kyc' ? 'kyc' : 'profile',
      };
    }
  }

  return { profileCompleted: true, signupStep: 'complete' };
}

export async function syncAuthCompletionState(user: AuthUser): Promise<void> {
  const currentSignupStep = useAuthFlowStore.getState().signupStep;
  const derived = await deriveAuthCompletion(user, currentSignupStep);

  useAuthStore.getState().setProfileCompleted(derived.profileCompleted);
  useAuthFlowStore.getState().setSignupStep(derived.signupStep);
}

export function applyAuthCompletion(
  profileCompleted: boolean,
  signupStep: SignupStep,
): void {
  useAuthStore.getState().setProfileCompleted(profileCompleted);
  useAuthFlowStore.getState().setSignupStep(signupStep);
}
