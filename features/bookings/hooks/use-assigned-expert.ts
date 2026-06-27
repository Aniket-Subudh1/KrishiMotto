import { useQuery } from '@tanstack/react-query';

import { ensureUploadUrlCacheHydrated } from '@/lib/upload-url-cache';
import { bookingService } from '@/services/booking.service';
import type { FarmerExpertSummary } from '@/types/expert';

export const ASSIGNED_EXPERT_KEYS = {
  detail: (expertId: string) => ['assigned-expert', expertId] as const,
};

function normalizeExpertSummary(payload: FarmerExpertSummary): FarmerExpertSummary {
  return {
    ...payload,
    name: payload.name?.trim() || undefined,
    specialisation: payload.specialisation?.trim() || undefined,
    qualification: payload.qualification?.trim() || undefined,
  };
}

export function useAssignedExpert(
  expertId: string | null | undefined,
  options?: { enabled?: boolean },
) {
  const enabled = (options?.enabled ?? true) && Boolean(expertId);

  return useQuery({
    queryKey: ASSIGNED_EXPERT_KEYS.detail(expertId ?? ''),
    queryFn: async () => {
      await ensureUploadUrlCacheHydrated();
      const { data } = await bookingService.getExpert(expertId!);
      return normalizeExpertSummary(data.data);
    },
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
}
