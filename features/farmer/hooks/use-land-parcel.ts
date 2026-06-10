import { useMutation } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import { farmerService } from '@/services/farmer.service';
import type { CreateLandParcelPayload } from '@/types/farmer';

export function useCreateLandParcel() {
  return useMutation({
    mutationFn: async (payload: CreateLandParcelPayload) => {
      const { data } = await farmerService.createLandParcel(payload);
      return data.data;
    },
  });
}

export function getLandParcelError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
