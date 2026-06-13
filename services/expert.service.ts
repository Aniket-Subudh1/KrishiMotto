import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type {
  ExpertDocumentSubmitPayload,
  ExpertProfile,
  ExpertProfileUpdatePayload,
} from '@/types/expert';

export const expertService = {
  getProfile: () => apiClient.get<V1Response<ExpertProfile>>('/expert/profile'),

  updateProfile: (payload: ExpertProfileUpdatePayload) =>
    apiClient.put<V1Response<ExpertProfile>>('/expert/profile', payload),

  submitDocuments: (payload: ExpertDocumentSubmitPayload) =>
    apiClient.post<V1Response<ExpertProfile>>('/expert/profile/documents', payload),
};
