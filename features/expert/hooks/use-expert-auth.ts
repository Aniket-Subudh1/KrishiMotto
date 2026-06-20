import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSendOtp } from '@/features/auth/hooks/use-send-otp';
import { getApiErrorMessage } from '@/lib/api-error';
import { queryClient } from '@/lib/query-client';
import {
  ensureUploadUrlCacheHydrated,
  withResolvedProfilePhoto,
} from '@/lib/upload-url-cache';
import { authService } from '@/services/auth.service';
import { expertService } from '@/services/expert.service';
import { useAuthStore } from '@/stores/auth.store';
import type {
  ExpertAuthenticatePayload,
  ExpertRegisterPayload,
} from '@/types/auth';
import type {
  ExpertDocumentSubmitPayload,
  ExpertProfile,
  ExpertProfileUpdatePayload,
} from '@/types/expert';

export const EXPERT_PROFILE_KEYS = {
  profile: ['expert', 'profile'] as const,
  kycStatus: ['expert', 'kyc-status'] as const,
};

export async function seedExpertProfileQueryCache(profile: ExpertProfile) {
  await ensureUploadUrlCacheHydrated();
  queryClient.setQueryData(EXPERT_PROFILE_KEYS.profile, withResolvedProfilePhoto(profile));
}

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
  const isExpert = useAuthStore((s) => s.user?.role === 'EXPERT');

  return useQuery({
    queryKey: EXPERT_PROFILE_KEYS.profile,
    queryFn: async () => {
      await ensureUploadUrlCacheHydrated();
      const { data } = await expertService.getProfile();
      return withResolvedProfilePhoto(data.data);
    },
    enabled: enabled && isExpert,
  });
}

export function useExpertKycStatus(enabled = true, refetchInterval?: number) {
  return useQuery({
    queryKey: EXPERT_PROFILE_KEYS.kycStatus,
    queryFn: async () => {
      const { data } = await expertService.getKycStatus();
      return data.data;
    },
    enabled,
    refetchInterval,
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
      const previous = queryClient.getQueryData<ExpertProfile>(EXPERT_PROFILE_KEYS.profile);
      const merged = withResolvedProfilePhoto({
        ...previous,
        ...profile,
        profilePicKey: profile.profilePicKey ?? previous?.profilePicKey,
      });
      queryClient.setQueryData(EXPERT_PROFILE_KEYS.profile, merged);
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
      const previous = queryClient.getQueryData<ExpertProfile>(EXPERT_PROFILE_KEYS.profile);
      const merged = withResolvedProfilePhoto({
        ...previous,
        ...profile,
        profilePicKey: profile.profilePicKey ?? previous?.profilePicKey,
      });
      queryClient.setQueryData(EXPERT_PROFILE_KEYS.profile, merged);
      queryClient.invalidateQueries({ queryKey: EXPERT_PROFILE_KEYS.kycStatus });
    },
  });
}

export function getMutationError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}

export function getExpertProfileError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
