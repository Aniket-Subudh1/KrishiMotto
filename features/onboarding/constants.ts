import type { ImageSource } from 'expo-image';

export type OnboardingSlideId = 'smart-farming' | 'land-insights' | 'experts-ai';

export type OnboardingSlide = {
  id: OnboardingSlideId;
  image: ImageSource;
  hasBadge?: boolean;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: 'smart-farming',
    image: require('@/assets/images/onboarding/onboarding-farming.png'),
    hasBadge: true,
  },
  {
    id: 'land-insights',
    image: require('@/assets/images/onboarding/onboarding-satellite.png'),
  },
  {
    id: 'experts-ai',
    image: require('@/assets/images/onboarding/onboarding-experts.png'),
    hasBadge: true,
  },
];
