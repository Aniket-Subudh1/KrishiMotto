import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  type AppLocale,
  isSupportedLocale,
  SUPPORTED_LOCALES,
} from '@/constants/languages';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import or from '@/locales/or.json';
import ta from '@/locales/ta.json';
import te from '@/locales/te.json';

export function getDeviceLocale(): AppLocale {
  const deviceLang = Localization.getLocales()[0]?.languageCode ?? undefined;
  if (isSupportedLocale(deviceLang)) {
    return deviceLang;
  }
  return 'en';
}

export async function applyLocale(locale: AppLocale) {
  if (i18n.language !== locale) {
    await i18n.changeLanguage(locale);
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    or: { translation: or },
    ta: { translation: ta },
    te: { translation: te },
  },
  lng: 'en',
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LOCALES,
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export { i18n };
