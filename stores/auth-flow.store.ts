import { create } from 'zustand';

import type { SelectableRole } from '@/constants/roles';

export type AuthIntent = 'register' | 'sign-in';

type AuthFlowState = {
  intent: AuthIntent | null;
  selectedRole: SelectableRole | null;
  hasEnteredFromGetStarted: boolean;
  markEnteredFromGetStarted: () => void;
  setAuthFlow: (intent: AuthIntent, role: SelectableRole) => void;
  clearAuthFlow: () => void;
};

export const useAuthFlowStore = create<AuthFlowState>()((set) => ({
  intent: null,
  selectedRole: null,
  hasEnteredFromGetStarted: false,

  markEnteredFromGetStarted: () => set({ hasEnteredFromGetStarted: true }),

  setAuthFlow: (intent, role) => set({ intent, selectedRole: role }),

  clearAuthFlow: () =>
    set({ intent: null, selectedRole: null, hasEnteredFromGetStarted: false }),
}));
