import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type {
  CreateLandParcelPayload,
  FarmerProfile,
  FarmerProfileUpdatePayload,
  LandParcel,
} from '@/types/farmer';

export const farmerService = {
  getProfile: () => apiClient.get<V1Response<FarmerProfile>>('/farmer/profile'),

  updateProfile: (payload: FarmerProfileUpdatePayload) =>
    apiClient.put<V1Response<FarmerProfile>>('/farmer/profile', payload),

  createLandParcel: (payload: CreateLandParcelPayload) =>
    apiClient.post<{ data: LandParcel }>('/farmer/land', payload),

  listLandParcels: () => apiClient.get<{ data: { items: LandParcel[] } }>('/farmer/land'),
};
