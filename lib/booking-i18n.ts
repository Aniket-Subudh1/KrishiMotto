import type { ServiceIconType } from '@/types/catalog';
import type { StorageRequestStatus } from '@/types/storage';
import type { CreditPurpose, CropType, Season, SoilType, VisitPurpose } from '@/types/booking';
import { formatPaise } from '@/lib/currency';

/** Minimal translate fn used across screens — compatible with i18next `t` and simple stubs. */
export type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

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

function translateOrFallback(t: TranslateFn, key: string, fallback: string): string {
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function translateCropType(t: TranslateFn, type: CropType): string {
  return translateOrFallback(t, `enums.cropTypes.${type}`, type);
}

export function translateSoilType(t: TranslateFn, type: SoilType): string {
  return translateOrFallback(t, `enums.soilTypes.${type}`, type);
}

export function translateSeason(t: TranslateFn, season: Season): string {
  return translateOrFallback(t, `enums.seasons.${season}`, season);
}

export function translateVisitPurpose(t: TranslateFn, purpose: VisitPurpose): string {
  return t(VISIT_PURPOSE_I18N_KEYS[purpose]);
}

export function translateCreditPurpose(t: TranslateFn, purpose: CreditPurpose): string {
  return t(CREDIT_PURPOSE_I18N_KEYS[purpose]);
}

export function translateServiceTitle(
  t: TranslateFn,
  iconType: ServiceIconType,
  fallback: string,
): string {
  return translateOrFallback(t, `enums.services.${iconType}`, fallback);
}

export function getCatalogServicePriceLabel(
  service: { priceLabel?: string; basePricePaise?: number } | null | undefined,
  fallback = '…',
): string {
  if (service?.priceLabel?.trim()) {
    return service.priceLabel.trim();
  }
  if (service?.basePricePaise != null && service.basePricePaise > 0) {
    return formatPaise(service.basePricePaise);
  }
  return fallback;
}

export function translateServicePrice(
  t: TranslateFn,
  iconType: ServiceIconType,
  priceLabel: string,
  basePricePaise?: number,
): string {
  const fromCatalog = getCatalogServicePriceLabel({ priceLabel, basePricePaise });
  if (fromCatalog !== '…') {
    return fromCatalog;
  }
  return translateOrFallback(t, `enums.servicePrices.${iconType}`, priceLabel);
}

export function translateServiceDescription(
  t: TranslateFn,
  iconType: ServiceIconType,
  fallback?: string,
): string {
  if (fallback?.trim()) {
    return fallback.trim();
  }
  return translateOrFallback(
    t,
    `enums.serviceDescriptions.${iconType}`,
    translateServiceTitle(t, iconType, iconType),
  );
}

export function translateStorageStatus(t: TranslateFn, status: StorageRequestStatus): string {
  return translateOrFallback(t, `enums.storageStatuses.${status}`, status);
}

export function translateScheduleActivity(t: TranslateFn, name: string): string {
  const harvestPrefix = 'Harvest · ';
  if (name.startsWith(harvestPrefix)) {
    const crop = name.slice(harvestPrefix.length);
    return t('enums.scheduleActivities.harvest', { crop });
  }

  const key = SCHEDULE_ACTIVITY_KEYS[name];
  return key ? t(key) : name;
}
