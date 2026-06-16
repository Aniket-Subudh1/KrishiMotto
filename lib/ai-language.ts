import type { AppLocale } from '@/constants/languages';
import type { AiChatLanguage } from '@/types/ai';

const APP_TO_AI_LANG: Record<AppLocale, AiChatLanguage> = {
  en: 'english',
  hi: 'hindi',
  or: 'odia',
  ta: 'english',
  te: 'english',
};

const APP_TO_SPEECH_LOCALE: Record<AppLocale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  or: 'or-IN',
  ta: 'ta-IN',
  te: 'te-IN',
};

export function toAiChatLanguage(locale: AppLocale): AiChatLanguage {
  return APP_TO_AI_LANG[locale];
}

export function toSpeechLocale(locale: AppLocale): string {
  return APP_TO_SPEECH_LOCALE[locale];
}
