import { useMutation } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
  FarmerAuthenticatePayload,
  FarmerRegisterPayload,
  SendOtpPayload,
} from '@/types/auth';
import type { FarmerProfileUpdatePayload } from '@/types/farmer';

import { useUpdateFarmerProfile as useUpdateFarmerProfileMutation } from './use-farmer-profile';

export { FARMER_PROFILE_KEYS as FARMER_AUTH_KEYS } from './use-farmer-profile';

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
  return useUpdateFarmerProfileMutation();
}

export function getMutationError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
