import type { GeoPolygon } from '@/types/farmer';

export const CROP_TYPES = ['Cereal', 'Vegetable', 'Fruit', 'Pulses', 'Oilseeds'] as const;
export type CropType = (typeof CROP_TYPES)[number];

export const SEASONS = ['Rabi', 'Kharif', 'Zaid'] as const;
export type Season = (typeof SEASONS)[number];

export const SOIL_TYPES = ['Clay', 'Sandy', 'Loamy', 'Silty', 'Peaty', 'Chalky'] as const;
export type SoilType = (typeof SOIL_TYPES)[number];

export const VISIT_PURPOSES = [
  'Pest & disease diagnosis',
  'Advisory',
  'Inspection',
  'Other',
] as const;
export type VisitPurpose = (typeof VISIT_PURPOSES)[number];

export const BOOKING_STATUSES = [
  'PENDING_PAYMENT',
  'PAID',
  'OPEN',
  'ACCEPTED',
  'TRAVELLING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type ScheduledActivity = {
  name: string;
  date: string;
};

export type CropCalendarDetails = {
  projectTitle: string;
  cropName: string;
  cropType: CropType;
  fieldSizeAc: number;
  season: Season;
  startDate: string;
  endDate: string;
  scheduledActivities?: ScheduledActivity[];
};

export type CreateCropCalendarBookingPayload = {
  serviceIconType: 'CROP_CALENDAR';
  geometry: GeoPolygon;
  details: CropCalendarDetails;
  query?: string;
};

export type DroneSprayDetails = {
  cropType: CropType;
  sprayDate: string;
  query?: string;
};

export type CreateDroneSprayBookingPayload = {
  serviceIconType: 'DRONE_SPRAY';
  geometry: GeoPolygon;
  details: DroneSprayDetails;
  query?: string;
};

export type CropHealthDetails = {
  cropType: CropType;
  soilType: SoilType;
  transportIncluded: boolean;
  query?: string;
};

export type CreateCropHealthBookingPayload = {
  serviceIconType: 'CROP_HEALTH';
  geometry: GeoPolygon;
  details: CropHealthDetails;
  query?: string;
};

export type SoilHealthDetails = {
  cropType: CropType;
  soilType: SoilType;
  transportIncluded: boolean;
  query?: string;
};

export type CreateSoilHealthBookingPayload = {
  serviceIconType: 'SOIL_HEALTH';
  geometry: GeoPolygon;
  details: SoilHealthDetails;
  query?: string;
};

export type ExpertVisitDetails = {
  visitPurpose: VisitPurpose;
  cropType: CropType;
  soilType: SoilType;
  areaAc: number;
  preferredDate: string;
  query?: string;
};

export type CreateExpertVisitBookingPayload = {
  serviceIconType: 'EXPERT_VISIT';
  geometry: GeoPolygon;
  details: ExpertVisitDetails;
  query?: string;
};

export const CREDIT_PURPOSES = ['Inputs', 'Equipment', 'Labour', 'Other'] as const;
export type CreditPurpose = (typeof CREDIT_PURPOSES)[number];

export type PpacsCreditDetails = {
  loanAmountPaise: number;
  tenureDays: number;
  maxInterestPa: number;
  purpose: CreditPurpose;
  commodity?: string;
  quantityKg?: number;
  grade?: string;
};

export type CreatePpacsCreditBookingPayload = {
  serviceIconType: 'PPACS_CREDIT';
  details: PpacsCreditDetails;
  query?: string;
};

export type BookingPricing = {
  basePaise: number;
  areaUnits: number;
  transportPaise: number;
  totalPaise: number;
  computedAt: string;
};

export type BookingStatusTimelineEntry = {
  status: string;
  at: string;
  note?: string;
};

export type BookingCompletionDocument = {
  assetKey: string;
  label?: string;
  uploadedAt: string;
  uploadedBy?: string;
  /** Populated client-side after presign upload for opening the file. */
  publicUrl?: string;
};

export type AttachCompletionDocumentPayload = {
  assetKey: string;
  label?: string;
};

export type Booking = {
  id: string;
  orderId: string;
  serviceIconType: string;
  serviceTitle: string;
  paymentStatus: PaymentStatus;
  txnId?: string | null;
  bookingStatus: BookingStatus;
  expertId?: string | null;
  areaAcres?: number;
  quantityKg?: number;
  details: Record<string, unknown>;
  query?: string;
  scheduledDate?: string;
  pricing: BookingPricing;
  district?: string;
  pincode?: string;
  slaHours?: number;
  slaDueAt?: string | null;
  slaRemainingMinutes?: number | null;
  statusTimeline: BookingStatusTimelineEntry[];
  completionDocuments?: BookingCompletionDocument[];
  paymentUrl?: string | null;
  pollableUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type BookingListPage = {
  items: Booking[];
  nextCursor?: string;
  hasMore: boolean;
};
