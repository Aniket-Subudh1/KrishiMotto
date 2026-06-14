export const KYC_DOCUMENT_TYPES = [
  'ID_CERTIFICATE',
  'QUALIFICATION',
  'LICENSE',
  'OTHER',
] as const;

export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type ExpertKycDoc = {
  type: string;
  assetKey?: string;
  label?: string;
  verifiedAt?: string;
  documentUrl?: string;
};

export type ExpertLocation = {
  longitude: number;
  latitude: number;
};

export type ExpertProfile = {
  id: string;
  userId: string;
  name?: string;
  email?: string;
  phone?: string;
  specialisation?: string;
  qualification?: string;
  yearsExperience?: number;
  serviceDistricts?: string[];
  servicePincodes?: string[];
  kycStatus: KycStatus;
  kycDocs: ExpertKycDoc[];
  verifiedBadge: boolean;
  canAcceptOrders: boolean;
  profilePicKey?: string;
  profilePicUrl?: string;
  location?: ExpertLocation;
  createdAt: string;
  updatedAt: string;
};

export type ExpertProfileUpdatePayload = {
  name?: string;
  email?: string;
  phone?: string;
  specialisation?: string;
  qualification?: string;
  yearsExperience?: number;
  serviceDistricts?: string[];
  servicePincodes?: string[];
  profilePicKey?: string | null;
};

export type ExpertDocumentInput = {
  type: KycDocumentType;
  assetKey: string;
  label?: string;
};

export type ExpertDocumentSubmitPayload = {
  documents: ExpertDocumentInput[];
  longitude: number;
  latitude: number;
};

export type ExpertKycStatusResponse =
  | { applicable: false }
  | {
      applicable: true;
      status: KycStatus;
      approved: boolean;
      canProceed: boolean;
      canAcceptOrders: boolean;
      verifiedBadge: boolean;
    };
