import { Palette } from '@/constants/theme';
import type { Href } from 'expo-router';
import type { IconName } from '@/lib/icon-names';

export type ServiceDefinition = {
  key: string;
  icon: IconName;
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
    icon: 'map-marker-outline',
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
  {
    key: 'smart-contracts',
    icon: 'file-document-outline',
    titleKey: 'home.tools.myReceipts',
    badgeKey: 'home.tools.myReceiptsBody',
    href: '/services/smart-contracts',
    farmerOnly: true,
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
    badgeColor: Palette.indiaGreen,
  },
];

export const ALL_SERVICES: ServiceDefinition[] = [
  {
    key: 'calendar',
    icon: 'calendar-month-outline',
    titleKey: 'home.dashboard.services.calendar.title',
    badgeKey: 'home.dashboard.services.calendar.badge',
    href: '/services/crop-calendar',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  {
    key: 'drone',
    icon: 'quadcopter',
    titleKey: 'home.dashboard.services.drone.title',
    badgeKey: 'home.dashboard.services.drone.badge',
    href: '/services/drone-spray',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  {
    key: 'crop-health',
    icon: 'sprout-outline',
    titleKey: 'home.dashboard.services.cropHealth.title',
    badgeKey: 'home.dashboard.services.cropHealth.badge',
    href: '/services/crop-health',
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  {
    key: 'soil',
    icon: 'flask-outline',
    titleKey: 'home.dashboard.services.soil.title',
    badgeKey: 'home.dashboard.services.soil.badge',
    href: '/services/soil-health',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
  },
  {
    key: 'expert',
    icon: 'account-tie-outline',
    titleKey: 'home.dashboard.services.expert.title',
    badgeKey: 'home.dashboard.services.expert.badge',
    href: '/services/expert-visit',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  {
    key: 'harvest',
    icon: 'barcode-scan',
    titleKey: 'home.dashboard.services.harvest.title',
    badgeKey: 'home.dashboard.services.harvest.badge',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
  {
    key: 'loan',
    icon: 'bank-outline',
    titleKey: 'home.dashboard.services.loan.title',
    badgeKey: 'home.dashboard.services.loan.badge',
    href: '/services/ppacs-credit',
    farmerOnly: true,
    iconBg: 'rgba(70, 150, 47, 0.12)',
    iconColor: Palette.indiaGreen,
  },
  {
    key: 'insurance',
    icon: 'shield-check-outline',
    titleKey: 'home.dashboard.services.insurance.title',
    badgeKey: 'home.dashboard.services.insurance.badge',
    iconBg: 'rgba(26, 54, 93, 0.08)',
    iconColor: Palette.indigo,
  },
  {
    key: 'market',
    icon: 'trending-up',
    titleKey: 'home.dashboard.services.market.title',
    badgeKey: 'home.dashboard.services.market.badge',
    iconBg: 'rgba(244, 164, 96, 0.15)',
    iconColor: Palette.saffron,
    badgeColor: Palette.indiaGreen,
  },
  {
    key: 'lab',
    icon: 'file-document-outline',
    titleKey: 'home.dashboard.services.lab.title',
    badgeKey: 'home.dashboard.services.lab.badge',
    iconBg: 'rgba(233, 175, 67, 0.15)',
    iconColor: Palette.marigold,
  },
];
