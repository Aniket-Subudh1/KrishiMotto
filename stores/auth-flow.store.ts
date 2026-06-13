import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SelectableRole } from '@/constants/roles';
import type { LandType } from '@/types/farmer';

export type AuthIntent = 'register' | 'sign-in';

export type SignupStep = 'details' | 'otp' | 'profile' | 'land' | 'kyc' | 'complete';

/** @deprecated Use SignupStep */
export type FarmerSignupStep = SignupStep;

type AuthFlowState = {
  intent: AuthIntent | null;
  selectedRole: SelectableRole | null;
  hasEnteredFromGetStarted: boolean;
  phoneNumber: string;
  username: string;
  signupStep: SignupStep;
  landType: LandType;
  storedEmail: string;
  markEnteredFromGetStarted: () => void;
  setAuthFlow: (intent: AuthIntent, role: SelectableRole) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setUsername: (username: string) => void;
  setStoredEmail: (email: string) => void;
  setSignupStep: (step: SignupStep) => void;
  setLandType: (landType: LandType) => void;
  clearAuthFlow: () => void;
};

export const useAuthFlowStore = create<AuthFlowState>()(
  persist(
    (set) => ({
      intent: null,
      selectedRole: null,
      hasEnteredFromGetStarted: false,
      phoneNumber: '',
      username: '',
      signupStep: 'details',
      landType: 'OWNED',
      storedEmail: '',

      markEnteredFromGetStarted: () => set({ hasEnteredFromGetStarted: true }),

      setAuthFlow: (intent, role) => set({ intent, selectedRole: role }),

      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

      setUsername: (username) => set({ username }),

      setStoredEmail: (storedEmail) => set({ storedEmail }),

      setSignupStep: (signupStep) => set({ signupStep }),

      setLandType: (landType) => set({ landType }),

      clearAuthFlow: () =>
        set({
          intent: null,
          selectedRole: null,
          hasEnteredFromGetStarted: false,
          phoneNumber: '',
          username: '',
          signupStep: 'details',
          landType: 'OWNED',
          storedEmail: '',
        }),
    }),
    {
      name: 'krishimotto-auth-flow',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        intent: state.intent,
        selectedRole: state.selectedRole,
        hasEnteredFromGetStarted: state.hasEnteredFromGetStarted,
        signupStep: state.signupStep,
        landType: state.landType,
        phoneNumber: state.phoneNumber,
        username: state.username,
        storedEmail: state.storedEmail,
      }),
    },
  ),
);
