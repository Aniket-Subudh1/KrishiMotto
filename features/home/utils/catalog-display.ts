import type { Href } from 'expo-router';
import type { TranslateFn } from '@/lib/booking-i18n';

import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import type { GridService } from '@/features/home/components/services-grid';
import { translateServicePrice, translateServiceTitle } from '@/lib/booking-i18n';
import type { CatalogService, ServiceIconType } from '@/types/catalog';

export const SERVICE_ROUTES: Partial<Record<ServiceIconType, Href>> = {
  CROP_CALENDAR: '/services/crop-calendar',
  DRONE_SPRAY: '/services/drone-spray',
  CROP_HEALTH: '/services/crop-health',
  SOIL_HEALTH: '/services/soil-health',
  EXPERT_VISIT: '/services/expert-visit',
  PPACS_CREDIT: '/services/ppacs-credit',
  STORAGE: '/services/storage',
  CROP_TRACKER: '/services/crop-tracker',
};

const FEATURED_SERVICE_ORDER: ServiceIconType[] = [
  'CROP_CALENDAR',
  'DRONE_SPRAY',
  'CROP_HEALTH',
  'SOIL_HEALTH',
  'EXPERT_VISIT',
];

export function isBookableService(iconType: ServiceIconType): boolean {
  return Boolean(SERVICE_ROUTES[iconType]);
}

export function partitionCatalogServices(services: CatalogService[]) {
  const bookable: CatalogService[] = [];
  const comingSoon: CatalogService[] = [];

  for (const service of services) {
    if (isBookableService(service.iconType)) {
      bookable.push(service);
    } else {
      comingSoon.push(service);
    }
  }

  return { bookable, comingSoon };
}

export function sortFeaturedServices(services: CatalogService[]): CatalogService[] {
  return [...services].sort((left, right) => {
    const leftIndex = FEATURED_SERVICE_ORDER.indexOf(left.iconType);
    const rightIndex = FEATURED_SERVICE_ORDER.indexOf(right.iconType);
    const normalizedLeft = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
    const normalizedRight = rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;

    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft - normalizedRight;
    }

    return left.sortOrder - right.sortOrder;
  });
}

export function toGridService(service: CatalogService, t: TranslateFn): GridService {
  const iconStyle = getServiceIconStyle(service.iconType);

  return {
    key: service.id,
    title: translateServiceTitle(t, service.iconType, service.title),
    badge: translateServicePrice(t, service.iconType, service.priceLabel),
    icon: iconStyle.icon,
    iconBg: iconStyle.iconBg,
    iconColor: iconStyle.iconColor,
    badgeColor: iconStyle.badgeColor,
    href: SERVICE_ROUTES[service.iconType],
  };
}
