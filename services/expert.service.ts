import { apiClient } from '@/lib/api-client';
import {
  cleanListParams,
  normalizeExpertBookingListPage,
} from '@/lib/expert-marketplace';
import type { V1Response } from '@/types/api';
import type {
  ExpertBooking,
  ExpertBookingListPage,
  ExpertNotification,
  ExpertNotificationListPage,
  ExpertOrderDocumentAttachPayload,
  ExpertOrderStatusUpdatePayload,
  ListExpertNotificationsParams,
  ListExpertOrdersParams,
  ListExpertRequestsParams,
} from '@/types/expert-booking';
import type {
  ExpertDocumentSubmitPayload,
  ExpertKycStatusResponse,
  ExpertProfile,
  ExpertProfileUpdatePayload,
} from '@/types/expert';

export const expertService = {
  getProfile: () => apiClient.get<V1Response<ExpertProfile>>('/expert/profile'),

  getKycStatus: () => apiClient.get<V1Response<ExpertKycStatusResponse>>('/kyc-status'),

  updateProfile: (payload: ExpertProfileUpdatePayload) =>
    apiClient.put<V1Response<ExpertProfile>>('/expert/profile', payload),

  submitDocuments: (payload: ExpertDocumentSubmitPayload) =>
    apiClient.post<V1Response<ExpertProfile>>('/expert/profile/documents', payload),

  listRequests: (params?: ListExpertRequestsParams) =>
    apiClient
      .get<V1Response<ExpertBookingListPage>>('/expert/requests', {
        params: cleanListParams(params),
      })
      .then(({ data }) => ({
        ...data,
        data: normalizeExpertBookingListPage(data.data),
      })),

  getRequest: (id: string) =>
    apiClient.get<V1Response<{ item: ExpertBooking }>>(`/expert/requests/${id}`),

  acceptRequest: (id: string) =>
    apiClient.post<V1Response<{ item: ExpertBooking; accepted: boolean }>>(
      `/expert/requests/${id}/accept`,
    ),

  listOrders: (params?: ListExpertOrdersParams) =>
    apiClient
      .get<V1Response<ExpertBookingListPage>>('/expert/orders', {
        params: cleanListParams(params),
      })
      .then(({ data }) => ({
        ...data,
        data: normalizeExpertBookingListPage(data.data),
      })),

  getOrder: (id: string) =>
    apiClient.get<V1Response<{ item: ExpertBooking }>>(`/expert/orders/${id}`),

  advanceOrderStatus: (id: string, payload: ExpertOrderStatusUpdatePayload) =>
    apiClient.post<V1Response<{ item: ExpertBooking }>>(`/expert/orders/${id}/status`, payload),

  attachOrderDocument: (id: string, payload: ExpertOrderDocumentAttachPayload) =>
    apiClient.post<V1Response<{ item: ExpertBooking }>>(`/expert/orders/${id}/documents`, payload),

  listNotifications: (params?: ListExpertNotificationsParams) =>
    apiClient.get<V1Response<ExpertNotificationListPage>>('/expert/notifications', {
      params: {
        cursor: params?.cursor,
        limit: params?.limit,
        ...(params?.unreadOnly ? { unreadOnly: 'true' } : {}),
      },
    }),

  markNotificationRead: (id: string) =>
    apiClient.post<V1Response<{ notification: ExpertNotification }>>(
      `/expert/notifications/${id}/read`,
    ),
};
