import { isServiceIconType } from '@/features/home/utils/booking-display';
import type { AiSuggestedAction, AiSuggestedActionType } from '@/types/ai';
import type { ServiceIconType } from '@/types/catalog';

const ACTION_ICON_FALLBACK: Partial<Record<AiSuggestedActionType, ServiceIconType>> = {
  GENERATE_CALENDAR: 'CROP_CALENDAR',
  DIAGNOSE_CROP: 'CROP_HEALTH',
  EXPLAIN_SOIL: 'SOIL_HEALTH',
  VIEW_STORAGE: 'STORAGE',
  APPLY_CREDIT: 'PPACS_CREDIT',
  BOOK_EXPERT_VISIT: 'EXPERT_VISIT',
};

export function resolveActionIconType(action: AiSuggestedAction): ServiceIconType {
  if (action.serviceIconType && isServiceIconType(action.serviceIconType)) {
    return action.serviceIconType;
  }

  return ACTION_ICON_FALLBACK[action.action] ?? 'CROP_CALENDAR';
}
