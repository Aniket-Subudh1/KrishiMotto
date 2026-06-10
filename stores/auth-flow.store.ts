import { create } from 'zustand';

import type { SelectableRole } from '@/constants/roles';
import type { LandType } from '@/types/farmer';

export type AuthIntent = 'register' | 'sign-in';

export type FarmerSignupStep = 'details' | 'otp' | 'profile';

type AuthFlowState = {
  intent: AuthIntent | null;
  selectedRole: SelectableRole | null;
  hasEnteredFromGetStarted: boolean;
  phoneNumber: string;
  username: string;
  signupStep: FarmerSignupStep;
  markEnteredFromGetStarted: () => void;
  setAuthFlow: (intent: AuthIntent, role: SelectableRole) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setUsername: (username: string) => void;
  setSignupStep: (step: FarmerSignupStep) => void;
  clearAuthFlow: () => void;
};

export type FarmerProfileDraft = {
  name: string;
  district: string;
  state: string;
  country: string;
  landType: LandType;
  primaryCrop: string;
};

export const useAuthFlowStore = create<AuthFlowState>()((set) => ({
  intent: null,
  selectedRole: null,
  hasEnteredFromGetStarted: false,
  phoneNumber: '',
  username: '',
  signupStep: 'details',

  markEnteredFromGetStarted: () => set({ hasEnteredFromGetStarted: true }),

  setAuthFlow: (intent, role) => set({ intent, selectedRole: role }),

  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

  setUsername: (username) => set({ username }),

  setSignupStep: (signupStep) => set({ signupStep }),

  clearAuthFlow: () =>
    set({
      intent: null,
      selectedRole: null,
      hasEnteredFromGetStarted: false,
      phoneNumber: '',
      username: '',
      signupStep: 'details',
    }),
}));
