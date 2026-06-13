import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type {
  CreateLandParcelPayload,
  FarmerProfile,
  FarmerProfileUpdatePayload,
  LandParcel,
  UpdateLandParcelPayload,
} from '@/types/farmer';

export const farmerService = {
  getProfile: () => apiClient.get<V1Response<FarmerProfile>>('/farmer/profile'),

  updateProfile: (payload: FarmerProfileUpdatePayload) =>
    apiClient.put<V1Response<FarmerProfile>>('/farmer/profile', payload),

  createLandParcel: (payload: CreateLandParcelPayload) =>
    apiClient.post<V1Response<LandParcel>>('/farmer/land', payload),

  listLandParcels: () => apiClient.get<V1Response<{ items: LandParcel[] }>>('/farmer/land'),

  getLandParcel: (id: string) => apiClient.get<V1Response<LandParcel>>(`/farmer/land/${id}`),

  updateLandParcel: (id: string, payload: UpdateLandParcelPayload) =>
    apiClient.put<V1Response<LandParcel>>(`/farmer/land/${id}`, payload),

  deleteLandParcel: (id: string) => apiClient.delete(`/farmer/land/${id}`),
};
