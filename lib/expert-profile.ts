import type { ExpertProfile } from '@/types/expert';
import type { FarmerProfile } from '@/types/farmer';

export function isFarmerProfileComplete(profile: Pick<FarmerProfile, 'name' | 'district' | 'state'>): boolean {
  return Boolean(
    profile.name?.trim() && profile.district?.trim() && profile.state?.trim(),
  );
}

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

/** KYC docs uploaded and awaiting or passed verification (rejected requires resubmission). */
export function isExpertKycSubmitted(profile: ExpertProfile): boolean {
  return (
    profile.kycDocs.length > 0 &&
    (profile.kycStatus === 'PENDING' || profile.kycStatus === 'VERIFIED')
  );
}
