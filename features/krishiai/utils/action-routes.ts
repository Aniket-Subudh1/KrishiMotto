import type { Href } from 'expo-router';

import type { AiSuggestedAction } from '@/types/ai';
import type { ServiceIconType } from '@/types/catalog';

const SERVICE_ROUTES: Partial<Record<ServiceIconType, Href>> = {
  CROP_CALENDAR: '/services/crop-calendar',
  DRONE_SPRAY: '/services/drone-spray',
  CROP_HEALTH: '/services/crop-health',
  SOIL_HEALTH: '/services/soil-health',
  EXPERT_VISIT: '/services/expert-visit',
  PPACS_CREDIT: '/services/ppacs-credit',
};

const ACTION_ROUTES: Partial<Record<AiSuggestedAction['action'], Href>> = {
  GENERATE_CALENDAR: '/services/crop-calendar',
  DIAGNOSE_CROP: '/services/crop-health',
  EXPLAIN_SOIL: '/services/soil-health',
  APPLY_CREDIT: '/services/ppacs-credit',
  BOOK_EXPERT_VISIT: '/services/expert-visit',
};

export function resolveSuggestedActionRoute(action: AiSuggestedAction): Href | null {
  if (action.action === 'BOOK_SERVICE' && action.serviceIconType) {
    return SERVICE_ROUTES[action.serviceIconType as ServiceIconType] ?? null;
  }

  return ACTION_ROUTES[action.action] ?? null;
}
