import type { ExpertProfile, KycStatus } from '@/types/expert';
import { resolveProfilePhotoUrl } from '@/lib/upload-url-cache';

export function formatExpertLocation(
  location?: ExpertProfile['location'],
): string | null {
  if (!location) {
    return null;
  }

  return `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`;
}

export function formatExpertServiceDistricts(profile: ExpertProfile): string {
  return profile.serviceDistricts?.join(', ') ?? '';
}

export function formatExpertServicePincodes(profile: ExpertProfile): string {
  return profile.servicePincodes?.join(', ') ?? '';
}

export function getExpertProfilePhotoUrl(profile?: ExpertProfile | null): string | undefined {
  return resolveProfilePhotoUrl(profile ?? undefined);
}

export function translateExpertKycStatus(t: (key: string) => string, status: KycStatus): string {
  const key = `expertDashboard.profile.kycStatuses.${status.toLowerCase()}`;
  const translated = t(key);
  return translated === key ? status : translated;
}

export function joinCommaList(values?: string[]): string {
  return values?.join(', ') ?? '';
}

export function districtsToInput(values?: string[]): string {
  return joinCommaList(values);
}

export function pincodesToInput(values?: string[]): string {
  return joinCommaList(values);
}

export const KYC_DOC_LABEL_KEYS: Record<string, string> = {
  ID_CERTIFICATE: 'idCertificate',
  QUALIFICATION: 'qualificationDoc',
  LICENSE: 'licenseDoc',
  OTHER: 'otherDoc',
};

export function getKycDocumentLabelKey(type: string): string {
  return KYC_DOC_LABEL_KEYS[type] ?? 'otherDoc';
}
