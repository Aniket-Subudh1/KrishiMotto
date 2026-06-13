import { authClient } from '@/lib/auth-client';
import { apiClient } from '@/lib/api-client';
import type { LegacyResponse, V1Response } from '@/types/api';
import type {
  AuthTokensResponse,
  AuthUser,
  ExpertAuthenticatePayload,
  ExpertRegisterPayload,
  ExpertRegisterResponse,
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

  registerExpert: (payload: ExpertRegisterPayload) =>
    authClient.post<LegacyResponse<ExpertRegisterResponse>>('/expert/register', payload),

  authenticateExpert: (payload: ExpertAuthenticatePayload) =>
    authClient.post<LegacyResponse<AuthTokensResponse>>('/expert/authenticate', payload),

  refreshToken: (refreshToken: string) =>
    apiClient.post<V1Response<RefreshTokenResponse>>('/auth/refresh', { refreshToken }),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }, { skipAuthRefresh: true }),

  logoutAll: () => apiClient.post('/auth/logout-all', undefined, { skipAuthRefresh: true }),

  me: () => apiClient.get<V1Response<AuthUser>>('/me'),
};
