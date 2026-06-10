export type AppLocale = 'en' | 'hi' | 'or' | 'ta' | 'te';

export type LanguageOption = {
  code: AppLocale;
  label: string;
  nativeLabel: string;
};

export const SUPPORTED_LOCALES: AppLocale[] = ['en', 'hi', 'or', 'ta', 'te'];

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
];

export function isSupportedLocale(value: string | undefined): value is AppLocale {
  return SUPPORTED_LOCALES.includes(value as AppLocale);
}
