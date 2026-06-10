import { useTranslation } from 'react-i18next';

import type { AppLocale } from '@/constants/languages';
import { useLocaleStore } from '@/stores/locale.store';

/** Single hook for locale state and translations across the app. */
export function useAppLocale() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const { t, i18n } = useTranslation();

  return {
    locale,
    setLocale: (nextLocale: AppLocale) => setLocale(nextLocale),
    t,
    i18n,
  };
}
