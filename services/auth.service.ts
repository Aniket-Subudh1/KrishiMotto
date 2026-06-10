import { apiClient } from '@/lib/api-client';
import type { ApiResponse } from '@/types/api';
import type { AuthResponse, LoginPayload, RegisterPayload, RequestOtpPayload } from '@/types/auth';

export const authService = {
  requestOtp: (payload: RequestOtpPayload) =>
    apiClient.post<ApiResponse<{ message: string }>>('/auth/otp', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload),

  logout: () =>
    apiClient.post<ApiResponse<null>>('/auth/logout'),

  refreshToken: (refreshToken: string) =>
    apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh', { refreshToken }),

  me: () =>
    apiClient.get<ApiResponse<AuthResponse['user']>>('/auth/me'),
};
