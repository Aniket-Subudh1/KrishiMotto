import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSendOtp } from '@/features/auth/hooks/use-send-otp';
import { getApiErrorMessage } from '@/lib/api-error';
import { authService } from '@/services/auth.service';
import { expertService } from '@/services/expert.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
  ExpertAuthenticatePayload,
  ExpertRegisterPayload,
} from '@/types/auth';
import type {
  ExpertDocumentSubmitPayload,
  ExpertProfileUpdatePayload,
} from '@/types/expert';

export const EXPERT_PROFILE_KEYS = {
  profile: ['expert', 'profile'] as const,
};

export { useSendOtp };

export function useRegisterExpert() {
  return useMutation({
    mutationFn: async (payload: ExpertRegisterPayload) => {
      const { data } = await authService.registerExpert(payload);
      return data.response;
    },
  });
}

export function useAuthenticateExpert() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (payload: ExpertAuthenticatePayload) => {
      const { data } = await authService.authenticateExpert(payload);
      return data.response;
    },
    onSuccess: (response) => {
      setAuth(response.user, response.token, response.refreshToken);
    },
  });
}

export function useExpertProfile(enabled = true) {
  return useQuery({
    queryKey: EXPERT_PROFILE_KEYS.profile,
    queryFn: async () => {
      const { data } = await expertService.getProfile();
      return data.data;
    },
    enabled,
  });
}

export function useUpdateExpertProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ExpertProfileUpdatePayload) => {
      const { data } = await expertService.updateProfile(payload);
      return data.data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(EXPERT_PROFILE_KEYS.profile, profile);
    },
  });
}

export function useSubmitExpertDocuments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ExpertDocumentSubmitPayload) => {
      const { data } = await expertService.submitDocuments(payload);
      return data.data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(EXPERT_PROFILE_KEYS.profile, profile);
    },
  });
}

export function getMutationError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
