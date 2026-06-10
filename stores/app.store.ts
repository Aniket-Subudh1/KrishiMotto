import { create } from 'zustand';

type AppState = {
  isHydrated: boolean;
  setHydrated: (val: boolean) => void;
};

export const useAppStore = create<AppState>((set) => ({
  isHydrated: false,
  setHydrated: (val) => set({ isHydrated: val }),
}));
