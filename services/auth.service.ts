import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import type { LegacyResponse, V1Response } from '@/types/api';
import type {
  AuthTokensResponse,
  AuthUser,
  FarmerAuthenticatePayload,
  FarmerRegisterPayload,
  FarmerRegisterResponse,
  RefreshTokenResponse,
  SendOtpPayload,
  SendOtpResponse,
} from '@/types/auth';

export const authService = {
  sendOtp: (payload: SendOtpPayload) =>
    authClient.post<LegacyResponse<SendOtpResponse>>('/send-otp', payload),

  registerFarmer: (payload: FarmerRegisterPayload) =>
    authClient.post<LegacyResponse<FarmerRegisterResponse>>('/farmer/register', payload),

  authenticateFarmer: (payload: FarmerAuthenticatePayload) =>
    authClient.post<LegacyResponse<AuthTokensResponse>>('/farmer/authenticate', payload),

  refreshToken: (refreshToken: string) =>
    apiClient.post<V1Response<RefreshTokenResponse>>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  me: () => apiClient.get<V1Response<AuthUser>>('/me'),
};
