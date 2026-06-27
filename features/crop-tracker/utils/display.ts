import type { TranslateFn } from '@/lib/booking-i18n';
import { formatPaise } from '@/lib/currency';

export function translateDashboardStatus(
  t: TranslateFn,
  status: string,
  fallback: string,
): string {
  const key = `cropTracker.dashboardStatuses.${status}`;
  const translated = t(key);
  return translated === key ? fallback : translated;
}

export function translateQuantityStored(
  t: TranslateFn,
  quantityKg: number,
  fallback: string,
  locale: string,
): string {
  const quantity = quantityKg.toLocaleString(locale === 'en' ? 'en-IN' : locale);
  const key = 'cropTracker.quantityStored';
  const translated = t(key, { quantity });
  return translated === key ? fallback : translated;
}

export function translatePriceReferenceLabel(
  t: TranslateFn,
  amountPaise: number,
  fallback: string,
): string {
  const price = formatPaise(amountPaise);
  const key = 'cropTracker.pricePerKg';
  const translated = t(key, { price });
  return translated === key ? fallback : translated;
}

export function formatQuantityLine(
  t: TranslateFn,
  quantityKg: number,
  requestNumber: string,
  locale: string,
): string {
  const quantity = quantityKg.toLocaleString(locale === 'en' ? 'en-IN' : locale);
  return t('cropTracker.quantityLine', { quantity, requestNumber });
}
