import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AppLocale } from '@/constants/languages';
import { applyLocale, getDeviceLocale } from '@/lib/i18n';

type LocaleState = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: getDeviceLocale(),

      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'krishimotto-locale',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.locale) {
          void applyLocale(state.locale);
        }
      },
    },
  ),
);

useLocaleStore.subscribe((state, previousState) => {
  if (state.locale !== previousState.locale) {
    void applyLocale(state.locale);
  }
});
