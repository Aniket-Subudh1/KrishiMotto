import { useMutation } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import { authService } from '@/services/auth.service';
import { farmerService } from '@/services/farmer.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
  FarmerAuthenticatePayload,
  FarmerRegisterPayload,
  SendOtpPayload,
} from '@/types/auth';
import type { FarmerProfileUpdatePayload } from '@/types/farmer';

export const FARMER_AUTH_KEYS = {
  profile: ['farmer', 'profile'] as const,
};

export function useSendOtp() {
  return useMutation({
    mutationFn: async (payload: SendOtpPayload) => {
      const { data } = await authService.sendOtp(payload);
      return data.response;
    },
  });
}

export function useRegisterFarmer() {
  return useMutation({
    mutationFn: async (payload: FarmerRegisterPayload) => {
      const { data } = await authService.registerFarmer(payload);
      return data.response;
    },
  });
}

export function useAuthenticateFarmer() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (payload: FarmerAuthenticatePayload) => {
      const { data } = await authService.authenticateFarmer(payload);
      return data.response;
    },
    onSuccess: (response) => {
      setAuth(response.user, response.token, response.refreshToken);
    },
  });
}

export function useUpdateFarmerProfile() {
  const setProfileCompleted = useAuthStore((s) => s.setProfileCompleted);

  return useMutation({
    mutationFn: async (payload: FarmerProfileUpdatePayload) => {
      const { data } = await farmerService.updateProfile(payload);
      return data.data;
    },
    onSuccess: () => {
      setProfileCompleted(true);
    },
  });
}

export function getMutationError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
