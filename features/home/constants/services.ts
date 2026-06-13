import { Palette } from '@/constants/theme';
import type { Href } from 'expo-router';
import type { Ionicons } from '@expo/vector-icons';

export type ServiceDefinition = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  badgeKey: string;
  href?: Href;
  farmerOnly?: boolean;
  iconBg: string;
  iconColor: string;
  badgeColor?: string;
};

export const QUICK_ACTIONS: ServiceDefinition[] = [
  {
    key: 'add-field',
    icon: 'map-outline',
    titleKey: 'home.tools.addField',
    badgeKey: 'home.tools.addFieldBody',
    href: '/farmer/land-boundary',
    farmerOnly: true,
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
    badgeColor: Palette.indiaGreen,
  },
  {
    key: 'land-list',
    icon: 'layers-outline',
    titleKey: 'home.tools.myFields',
    badgeKey: 'home.tools.myFieldsBody',
    href: '/(tabs)/land',
    farmerOnly: true,
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
    badgeColor: Palette.indiaGreen,
  },
];

export const ALL_SERVICES: ServiceDefinition[] = [
  {
    key: 'calendar',
    icon: 'calendar-outline',
    titleKey: 'home.dashboard.services.calendar.title',
    badgeKey: 'home.dashboard.services.calendar.badge',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  {
    key: 'drone',
    icon: 'airplane-outline',
    titleKey: 'home.dashboard.services.drone.title',
    badgeKey: 'home.dashboard.services.drone.badge',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  {
    key: 'soil',
    icon: 'flask-outline',
    titleKey: 'home.dashboard.services.soil.title',
    badgeKey: 'home.dashboard.services.soil.badge',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
  },
  {
    key: 'harvest',
    icon: 'scan-outline',
    titleKey: 'home.dashboard.services.harvest.title',
    badgeKey: 'home.dashboard.services.harvest.badge',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  {
    key: 'loan',
    icon: 'cash-outline',
    titleKey: 'home.dashboard.services.loan.title',
    badgeKey: 'home.dashboard.services.loan.badge',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  {
    key: 'insurance',
    icon: 'shield-checkmark-outline',
    titleKey: 'home.dashboard.services.insurance.title',
    badgeKey: 'home.dashboard.services.insurance.badge',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  {
    key: 'market',
    icon: 'trending-up-outline',
    titleKey: 'home.dashboard.services.market.title',
    badgeKey: 'home.dashboard.services.market.badge',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
    badgeColor: Palette.indiaGreen,
  },
  {
    key: 'lab',
    icon: 'document-text-outline',
    titleKey: 'home.dashboard.services.lab.title',
    badgeKey: 'home.dashboard.services.lab.badge',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
];
