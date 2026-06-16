import type { Ionicons } from '@expo/vector-icons';

import { Palette } from '@/constants/theme';
import type { ServiceIconType } from '@/types/catalog';

export type ServiceIconStyle = {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  badgeColor?: string;
};

/** Maps backend `iconType` enum values to Ionicons used on the farmer home grid. */
export const SERVICE_ICON_MAP: Record<ServiceIconType, ServiceIconStyle> = {
  CROP_CALENDAR: {
    icon: 'calendar-outline',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  DRONE_SPRAY: {
    icon: 'airplane-outline',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  CROP_HEALTH: {
    icon: 'leaf-outline',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  SOIL_HEALTH: {
    icon: 'flask-outline',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
  },
  EXPERT_VISIT: {
    icon: 'person-outline',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  PPACS_CREDIT: {
    icon: 'cash-outline',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  STORAGE: {
    icon: 'cube-outline',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  CROP_TRACKER: {
    icon: 'pulse-outline',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
    badgeColor: Palette.indiaGreen,
  },
  IRRIGATION: {
    icon: 'water-outline',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  FERTILIZER: {
    icon: 'nutrition-outline',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  PEST_CONTROL: {
    icon: 'bug-outline',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
  },
  WEATHER: {
    icon: 'partly-sunny-outline',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  SEEDS: {
    icon: 'flower-outline',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  HARVEST: {
    icon: 'scan-outline',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  INSURANCE: {
    icon: 'shield-checkmark-outline',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  MARKET: {
    icon: 'trending-up-outline',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
    badgeColor: Palette.indiaGreen,
  },
};

const FALLBACK_ICON_STYLE: ServiceIconStyle = {
  icon: 'grid-outline',
  iconBg: 'rgba(26, 54, 93, 0.08)',
  iconColor: Palette.indigo,
};

export function getServiceIconStyle(iconType: ServiceIconType): ServiceIconStyle {
  return SERVICE_ICON_MAP[iconType] ?? FALLBACK_ICON_STYLE;
}
