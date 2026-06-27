import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type {
  AttachCompletionDocumentPayload,
  Booking,
  BookingListPage,
  CreateCropCalendarBookingPayload,
  CreateCropHealthBookingPayload,
  CreateDroneSprayBookingPayload,
  CreateExpertVisitBookingPayload,
  CreatePpacsCreditBookingPayload,
  CreateSoilHealthBookingPayload,
} from '@/types/booking';
import type { FarmerExpertSummary } from '@/types/expert';

export type ListBookingsParams = {
  status?: string;
  serviceIconType?: string;
  cursor?: string;
  limit?: number;
};

export const bookingService = {
  createCropCalendar: (payload: CreateCropCalendarBookingPayload) =>
    apiClient.post<V1Response<Booking>>('/farmer/bookings', payload),

  createDroneSpray: (payload: CreateDroneSprayBookingPayload) =>
    apiClient.post<V1Response<Booking>>('/farmer/bookings', payload),

  createCropHealth: (payload: CreateCropHealthBookingPayload) =>
    apiClient.post<V1Response<Booking>>('/farmer/bookings', payload),

  createSoilHealth: (payload: CreateSoilHealthBookingPayload) =>
    apiClient.post<V1Response<Booking>>('/farmer/bookings', payload),

  createExpertVisit: (payload: CreateExpertVisitBookingPayload) =>
    apiClient.post<V1Response<Booking>>('/farmer/bookings', payload),

  createPpacsCredit: (payload: CreatePpacsCreditBookingPayload) =>
    apiClient.post<V1Response<Booking>>('/farmer/bookings', payload),

  getBooking: (id: string) => apiClient.get<V1Response<Booking>>(`/farmer/bookings/${id}`),

  attachCompletionDocument: (id: string, payload: AttachCompletionDocumentPayload) =>
    apiClient.post<V1Response<Booking>>(`/farmer/bookings/${id}/completion-documents`, payload),

  listBookings: (params?: ListBookingsParams) =>
    apiClient.get<V1Response<BookingListPage>>('/farmer/bookings', { params }),

  getExpert: (expertId: string) =>
    apiClient.get<V1Response<FarmerExpertSummary>>(`/farmer/experts/${expertId}`),
};
