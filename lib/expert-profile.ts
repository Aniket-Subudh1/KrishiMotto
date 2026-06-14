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

/** KYC docs and location submitted — awaiting or passed admin review. */
export function isExpertKycSubmitted(profile: ExpertProfile): boolean {
  return (
    profile.kycDocs.length > 0 &&
    Boolean(profile.location) &&
    (profile.kycStatus === 'PENDING' || profile.kycStatus === 'VERIFIED')
  );
}

export function isExpertAwaitingVerification(profile: ExpertProfile): boolean {
  return profile.kycStatus === 'PENDING' && isExpertKycSubmitted(profile);
}

export function isExpertVerified(profile: ExpertProfile): boolean {
  return profile.kycStatus === 'VERIFIED' && profile.verifiedBadge;
}

export function isExpertKycRejected(profile: ExpertProfile): boolean {
  return profile.kycStatus === 'REJECTED';
}
