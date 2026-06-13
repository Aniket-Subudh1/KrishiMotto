import type { ExpertProfile } from '@/types/expert';

export function isExpertProfileComplete(profile: ExpertProfile): boolean {
  return Boolean(
    profile.name?.trim() &&
      profile.specialisation?.trim() &&
      profile.qualification?.trim() &&
      profile.yearsExperience !== undefined &&
      profile.yearsExperience >= 0 &&
      ((profile.serviceDistricts?.length ?? 0) > 0 ||
        (profile.servicePincodes?.length ?? 0) > 0),
  );
}

export function isExpertKycSubmitted(profile: ExpertProfile): boolean {
  return profile.kycDocs.length > 0 && profile.kycStatus !== 'UNVERIFIED';
}
