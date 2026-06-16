import type { AppIconName } from '@/components/ui/app-icon';
import { Palette } from '@/constants/theme';
import type { ServiceIconType } from '@/types/catalog';

export type ServiceIconStyle = {
  icon: AppIconName;
  iconBg: string;
  iconColor: string;
  badgeColor?: string;
};

/** Maps backend `iconType` enum values to icons used on the farmer home grid. */
export const SERVICE_ICON_MAP: Record<ServiceIconType, ServiceIconStyle> = {
  CROP_CALENDAR: {
    icon: 'calendar-month-outline',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  DRONE_SPRAY: {
    icon: 'quadcopter',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  CROP_HEALTH: {
    icon: 'sprout-outline',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  SOIL_HEALTH: {
    icon: 'flask-outline',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
  },
  EXPERT_VISIT: {
    icon: 'account-tie-outline',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  PPACS_CREDIT: {
    icon: 'bank-outline',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  STORAGE: {
    icon: 'warehouse',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  CROP_TRACKER: {
    icon: 'chart-timeline-variant',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
    badgeColor: Palette.indiaGreen,
  },
  IRRIGATION: {
    icon: 'water-pump',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  FERTILIZER: {
    icon: 'bottle-tonic-plus-outline',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  PEST_CONTROL: {
    icon: 'bug-outline',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
  },
  WEATHER: {
    icon: 'weather-partly-cloudy',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  SEEDS: {
    icon: 'seed-outline',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  HARVEST: {
    icon: 'barley',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  INSURANCE: {
    icon: 'shield-check-outline',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  MARKET: {
    icon: 'chart-line',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
    badgeColor: Palette.indiaGreen,
  },
};

const FALLBACK_ICON_STYLE: ServiceIconStyle = {
  icon: 'view-grid-outline',
  iconBg: 'rgba(26, 54, 93, 0.08)',
  iconColor: Palette.indigo,
};

export function getServiceIconStyle(iconType: ServiceIconType): ServiceIconStyle {
  return SERVICE_ICON_MAP[iconType] ?? FALLBACK_ICON_STYLE;
}
