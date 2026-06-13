export type LandType = 'OWNED' | 'LEASED';

export type GeoPolygon = {
  type: 'Polygon';
  coordinates: [number, number][][];
};

export type GeoPoint = {
  type: 'Point';
  coordinates: [number, number];
};

export type LandParcel = {
  id: string;
  farmerId: string;
  name: string;
  geometry: GeoPolygon;
  areaAcres: number;
  centroid: GeoPoint;
  landType: LandType;
  createdAt: string;
  updatedAt: string;
};

export type CreateLandParcelPayload = {
  name?: string;
  geometry: GeoPolygon;
  landType?: LandType;
};

export type UpdateLandParcelPayload = {
  name?: string;
  geometry?: GeoPolygon;
  landType?: LandType;
};

export type FarmerProfile = {
  id: string;
  userId: string;
  name?: string;
  district?: string;
  state?: string;
  country?: string;
  landType?: LandType;
  totalAcres?: number;
  profilePicKey?: string;
  profilePicUrl?: string;
  currentSeason?: string | null;
  primaryCrop?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FarmerProfileUpdatePayload = {
  name?: string;
  district?: string;
  state?: string;
  country?: string;
  landType?: LandType;
  profilePicKey?: string | null;
  currentSeason?: string | null;
  primaryCrop?: string | null;
};
