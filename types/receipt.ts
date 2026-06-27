export type PublicStorageReceipt = {
  qrId: string;
  publicUrl: string;
  notaryId: string;
  verificationStatus: 'PENDING' | 'ACCEPTED' | 'ANCHORED' | 'RELEASED';
  depositor: {
    name: string;
    location: string;
  };
  commodity: {
    cropType: string;
    deedWeightQtl: number;
    declaredWeightQtl: number;
    measuredWeightQtl: number;
    trustGrade: string;
  };
  assessment: {
    notes: string;
    intakeAt: string | null;
    storageLockAt: string | null;
    depositAt: string | null;
    expiryAt: string | null;
  };
  warehouse: {
    name: string;
    location: string;
    latitude: number | null;
    longitude: number | null;
  };
  smartContract: null | {
    contractNumber: string;
    receiptId: string;
    registerTxHash: string | null;
    explorerUrl: string | null;
    metadataTokenLabel: string;
    anchored: boolean;
  };
  scanCount: number;
  generatedAt: string;
};
