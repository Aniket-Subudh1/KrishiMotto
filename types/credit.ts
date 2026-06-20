import type { CreditPurpose } from '@/types/booking';

export const LOAN_STATUSES = [
  'SUBMITTED',
  'UNDER_REVIEW',
  'APPROVED',
  'DISBURSED',
  'REJECTED',
  'REPAID',
] as const;
export type LoanStatus = (typeof LOAN_STATUSES)[number];

export const KYC_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED'] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

export const SMART_CONTRACT_STATUSES = [
  'ACTIVE',
  'PARTIALLY_PLEDGED',
  'FULLY_PLEDGED',
  'RELEASED',
] as const;
export type SmartContractStatus = (typeof SMART_CONTRACT_STATUSES)[number];

export type BankDetails = {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
};

export type Lender = {
  id: string;
  name: string;
  type: string;
  licenseNumber?: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
};

export type FarmerKyc = {
  id: string;
  userId: string;
  method: string;
  status: KycStatus;
  fullName?: string;
  aadhaarMasked?: string;
  provider?: string;
  simulated: boolean;
  kycHash?: string;
  chainTxHash?: string;
  chainExplorerUrl?: string | null;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type SubmitFarmerKycPayload = {
  aadhaarNumber: string;
  fullName: string;
  otp?: string;
};

export type SmartContractWarehouseRef = {
  id: string;
  name: string;
};

export type SmartContractEvent = {
  type: string;
  at: string;
  quantityKg?: number;
  txHash?: string;
  explorerUrl?: string | null;
  simulated: boolean;
  note?: string;
  loanId?: string | null;
};

export type FarmerSmartContract = {
  id: string;
  contractNumber: string;
  storageRequestId: string;
  farmerId: string;
  warehouse: SmartContractWarehouseRef;
  cropType: string;
  totalQuantityKg: number;
  pledgedQuantityKg: number;
  freeQuantityKg: number;
  valuationPaise: number;
  binId?: string | null;
  sensorId?: string | null;
  status: SmartContractStatus;
  receiptId: string;
  registerTxHash?: string;
  chainNetwork: string;
  contractAddress?: string | null;
  explorerUrl?: string | null;
  simulated: boolean;
  events: SmartContractEvent[];
  createdAt: string;
  updatedAt: string;
};

export type Loan = {
  id: string;
  loanNumber: string;
  farmerId: string;
  farmerName?: string;
  lenderId: string;
  storageRequestId: string;
  smartContractId: string;
  cropType: string;
  collateralQuantityKg: number;
  requestedAmountPaise: number;
  approvedAmountPaise?: number | null;
  valuationPaise: number;
  tenureDays?: number;
  maxInterestRatePa?: number;
  purpose?: string;
  bankDetails: BankDetails;
  kycVerified: boolean;
  status: LoanStatus;
  statusTimeline: Array<{ status: string; at: string; by?: string; note?: string }>;
  rejectionReason?: string;
  pledgeTxHash?: string;
  pledgeExplorerUrl?: string | null;
  disburseTxHash?: string;
  disburseExplorerUrl?: string | null;
  releaseTxHash?: string;
  releaseExplorerUrl?: string | null;
  agreementHash?: string;
  simulated: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ApplyAgriCreditPayload = {
  smartContractId: string;
  lenderId: string;
  collateralQuantityKg: number;
  requestedAmountRupees: number;
  tenureDays: number;
  maxInterestRatePa: number;
  purpose: CreditPurpose;
  bankDetails: BankDetails;
};

export type LoanMilestoneStatus = 'pending' | 'in_progress' | 'done' | 'failed';

export type LoanMilestone = {
  step: string;
  label: string;
  status: LoanMilestoneStatus;
  at?: string;
  txHash?: string;
  explorerUrl?: string | null;
  note?: string;
};

export type LoanTrack = {
  loan: Loan;
  lender: { id: string; name: string; type: string };
  warehouseReceipt: {
    receiptId: string;
    contractNumber: string;
    cropType: string;
    totalQuantityKg: number;
    collateralQuantityKg: number;
    freeQuantityKg: number;
    anchored: boolean;
    registerTxHash?: string;
    registerExplorerUrl?: string | null;
    binId?: string | null;
    sensorId?: string | null;
  };
  kyc: {
    verified: boolean;
    status?: string;
    kycHash?: string;
    chainTxHash?: string;
    chainExplorerUrl?: string | null;
  };
  milestones: LoanMilestone[];
  nextAction?: string;
};
