import type { TFunction } from 'i18next';

import type { ServiceIconType } from '@/types/catalog';
import type { CreditPurpose, CropType, Season, SoilType, VisitPurpose } from '@/types/booking';

export const CREDIT_PURPOSE_I18N_KEYS: Record<CreditPurpose, string> = {
  Inputs: 'enums.creditPurposes.inputs',
  Equipment: 'enums.creditPurposes.equipment',
  Labour: 'enums.creditPurposes.labour',
  Other: 'enums.creditPurposes.other',
};

export const VISIT_PURPOSE_I18N_KEYS: Record<VisitPurpose, string> = {
  'Pest & disease diagnosis': 'enums.visitPurposes.pest',
  Advisory: 'enums.visitPurposes.advisory',
  Inspection: 'enums.visitPurposes.inspection',
  Other: 'enums.visitPurposes.other',
};

const SCHEDULE_ACTIVITY_KEYS: Record<string, string> = {
  Sowing: 'enums.scheduleActivities.sowing',
  '1st Irrigation': 'enums.scheduleActivities.firstIrrigation',
  'Fertilizer (DAP)': 'enums.scheduleActivities.fertilizerDap',
  'Fertilizer (Urea)': 'enums.scheduleActivities.fertilizerUrea',
  'Pest watch': 'enums.scheduleActivities.pestWatch',
};

function translateOrFallback(t: TFunction, key: string, fallback: string): string {
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function translateCropType(t: TFunction, type: CropType): string {
  return translateOrFallback(t, `enums.cropTypes.${type}`, type);
}

export function translateSoilType(t: TFunction, type: SoilType): string {
  return translateOrFallback(t, `enums.soilTypes.${type}`, type);
}

export function translateSeason(t: TFunction, season: Season): string {
  return translateOrFallback(t, `enums.seasons.${season}`, season);
}

export function translateVisitPurpose(t: TFunction, purpose: VisitPurpose): string {
  return t(VISIT_PURPOSE_I18N_KEYS[purpose]);
}

export function translateCreditPurpose(t: TFunction, purpose: CreditPurpose): string {
  return t(CREDIT_PURPOSE_I18N_KEYS[purpose]);
}

export function translateServiceTitle(
  t: TFunction,
  iconType: ServiceIconType,
  fallback: string,
): string {
  return translateOrFallback(t, `enums.services.${iconType}`, fallback);
}

export function translateServicePrice(
  t: TFunction,
  iconType: ServiceIconType,
  fallback: string,
): string {
  return translateOrFallback(t, `enums.servicePrices.${iconType}`, fallback);
}

export function translateServiceDescription(
  t: TFunction,
  iconType: ServiceIconType,
  fallback?: string,
): string {
  return translateOrFallback(
    t,
    `enums.serviceDescriptions.${iconType}`,
    fallback ?? translateServiceTitle(t, iconType, iconType),
  );
}

export function translateScheduleActivity(t: TFunction, name: string): string {
  const harvestPrefix = 'Harvest · ';
  if (name.startsWith(harvestPrefix)) {
    const crop = name.slice(harvestPrefix.length);
    return t('enums.scheduleActivities.harvest', { crop });
  }

  const key = SCHEDULE_ACTIVITY_KEYS[name];
  return key ? t(key) : name;
}
