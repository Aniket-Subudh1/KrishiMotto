export const STORAGE_REQUEST_STATUSES = [
  'SUBMITTED',
  'ACCEPTED',
  'PAYOUT_PAID',
  'PICKED_UP',
  'IN_STORAGE',
  'RELEASED',
] as const;

export type StorageRequestStatus = (typeof STORAGE_REQUEST_STATUSES)[number];

export type BankDetails = {
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
};

export type StorageDetails = {
  cropType: string;
  quantityKg: number;
};

export type CreateStorageRequestPayload = {
  warehouseId: string;
  bankDetails: BankDetails;
  details: StorageDetails;
  query?: string;
};

export type StoragePricing = {
  basePaise: number;
  areaUnits: number;
  transportPaise: number;
  totalPaise: number;
  computedAt: string;
};

export type StorageStatusTimelineEntry = {
  status: string;
  at: string;
  note?: string;
};

export type StorageRequest = {
  id: string;
  requestNumber: string;
  farmerId: string;
  warehouseId: string;
  cropType: string;
  quantityKg: number;
  details: Record<string, unknown>;
  bankDetails: BankDetails;
  valuationPaise: number;
  pricing: StoragePricing;
  status: StorageRequestStatus;
  statusTimeline: StorageStatusTimelineEntry[];
  query?: string;
  createdAt: string;
  updatedAt: string;
};

export type StorageRequestListPage = {
  items: StorageRequest[];
  nextCursor?: string;
  hasMore: boolean;
};

export type Warehouse = {
  id: string;
  name: string;
  location: string;
  district: string;
  state: string;
  pincode: string;
  capacityKg?: number;
  unitLabel?: string;
};

export type StorageSensorMetric = {
  value: number;
  unit: string;
  updatedMinutesAgo?: number;
};

export type StorageTemperaturePoint = {
  ts: string;
  temperatureC: number;
};

export type StorageIotDashboard = {
  storageRequestId: string;
  requestNumber: string;
  cropType: string;
  quantityKg: number;
  quantityLabel: string;
  location: {
    warehouseName: string;
    city: string;
    district: string;
    binId: string;
  };
  status: string;
  statusLabel: string;
  lastUpdated: string;
  priceReference: {
    amountPaise: number;
    perQuantityKg: number;
    label: string;
  };
  sensorReadings: {
    temperature: StorageSensorMetric;
    humidity: StorageSensorMetric;
    co2: StorageSensorMetric;
  };
  temperatureHistory24h: StorageTemperaturePoint[];
  aiForecast: {
    spoilageRisk: string;
    forecastWindow: string;
    qualityGrade: string;
    qualityStatus: string;
  };
  extensionPricing: {
    ratePaise: number;
    perQuantityKg: number;
    label: string;
  };
};

/** Statuses where live IoT dashboard is available from the API. */
export const TRACKABLE_STORAGE_STATUSES: readonly StorageRequestStatus[] = [
  'IN_STORAGE',
  'RELEASED',
] as const;
