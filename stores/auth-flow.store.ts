import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { SelectableRole } from '@/constants/roles';
import type { LandType } from '@/types/farmer';

export type AuthIntent = 'register' | 'sign-in';

export type FarmerSignupStep = 'details' | 'otp' | 'profile' | 'land' | 'complete';

type AuthFlowState = {
  intent: AuthIntent | null;
  selectedRole: SelectableRole | null;
  hasEnteredFromGetStarted: boolean;
  phoneNumber: string;
  username: string;
  signupStep: FarmerSignupStep;
  landType: LandType;
  markEnteredFromGetStarted: () => void;
  setAuthFlow: (intent: AuthIntent, role: SelectableRole) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setUsername: (username: string) => void;
  setSignupStep: (step: FarmerSignupStep) => void;
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

      markEnteredFromGetStarted: () => set({ hasEnteredFromGetStarted: true }),

      setAuthFlow: (intent, role) => set({ intent, selectedRole: role }),

      setPhoneNumber: (phoneNumber) => set({ phoneNumber }),

      setUsername: (username) => set({ username }),

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
        }),
    }),
    {
      name: 'krishimotto-auth-flow',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        signupStep: state.signupStep,
        landType: state.landType,
        phoneNumber: state.phoneNumber,
        username: state.username,
      }),
    },
  ),
);
