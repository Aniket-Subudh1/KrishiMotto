import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import { farmerService } from '@/services/farmer.service';
import type { FarmerProfileUpdatePayload } from '@/types/farmer';

export const FARMER_PROFILE_KEYS = {
  profile: ['farmer', 'profile'] as const,
};

export function useFarmerProfile(enabled = true) {
  return useQuery({
    queryKey: FARMER_PROFILE_KEYS.profile,
    queryFn: async () => {
      const { data } = await farmerService.getProfile();
      return data.data;
    },
    enabled,
  });
}

export function useUpdateFarmerProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FarmerProfileUpdatePayload) => {
      const { data } = await farmerService.updateProfile(payload);
      return data.data;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(FARMER_PROFILE_KEYS.profile, profile);
    },
  });
}

export function getFarmerProfileError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
