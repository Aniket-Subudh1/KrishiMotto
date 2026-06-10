import type { ImageSource } from 'expo-image';

export type OnboardingSlide = {
  id: string;
  image: ImageSource;
  tag: string;
  headline: string;
  accent: string;
  description: string;
  badge?: string;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'smart-farming',
    image: require('@/assets/images/onboarding/onboarding-farming.png'),
    tag: 'Crop Management',
    headline: 'Smart Farming,',
    accent: 'Made Simple',
    description:
      'Crop calendars, drone spraying, soil & crop analytics, expert visits, credit & storage — all in your language.',
    badge: 'Generate & diagnose with KrishiMotto AI',
  },
  {
    id: 'land-insights',
    image: require('@/assets/images/onboarding/onboarding-satellite.png'),
    tag: 'Land Analytics',
    headline: 'Know Your Land,',
    accent: 'Act with Confidence',
    description:
      'Multispectral & hyperspectral data turned into plain-language advice, treatment plans, and one-tap fertiliser schedules.',
  },
  {
    id: 'experts-ai',
    image: require('@/assets/images/onboarding/onboarding-experts.png'),
    tag: 'Expert Network',
    headline: 'Experts & AI,',
    accent: 'On Your Side',
    description:
      'AI pre-diagnosis before the expert arrives. Ask anything in Hindi, Odia, Telugu, or Tamil — best loan offers surfaced for you.',
    badge: 'Powered by KrishiMotto AI',
  },
];
