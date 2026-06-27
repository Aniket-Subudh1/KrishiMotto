import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { resolveLocationFromPostOffices } from '@/lib/india-location';
import { indiaLocationService } from '@/services/india-location.service';
import type { IndiaLocationDirectory, PincodeLookupResult } from '@/types/india-location';

export const INDIA_LOCATION_KEYS = {
  directory: ['india-location', 'directory'] as const,
  pincode: (pincode: string) => ['india-location', 'pincode', pincode] as const,
};

async function fetchPincodeLocation(
  pincode: string,
  directory: IndiaLocationDirectory,
): Promise<PincodeLookupResult | null> {
  const response = await indiaLocationService.lookupPincodeResponse(pincode);
  if (!response?.PostOffice?.length) {
    return null;
  }

  const first = response.PostOffice[0];
  const resolved = resolveLocationFromPostOffices(response.PostOffice, directory);

  return {
    pincode,
    state: resolved?.state ?? first.State.trim(),
    district: resolved?.district ?? first.District.trim(),
    rawState: first.State.trim(),
    rawDistrict: first.District.trim(),
  };
}

export function useIndiaLocationDirectory() {
  return useQuery({
    queryKey: INDIA_LOCATION_KEYS.directory,
    queryFn: () => indiaLocationService.getStatesAndDistricts(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
  });
}

export function usePincodeLookupOnBlur() {
  const queryClient = useQueryClient();
  const directoryQuery = useIndiaLocationDirectory();

  const lookupPincode = useCallback(
    async (pincode: string): Promise<PincodeLookupResult | null> => {
      if (!/^\d{6}$/.test(pincode) || !directoryQuery.data) {
        return null;
      }

      return queryClient.fetchQuery({
        queryKey: INDIA_LOCATION_KEYS.pincode(pincode),
        queryFn: () => fetchPincodeLocation(pincode, directoryQuery.data!),
        staleTime: 24 * 60 * 60 * 1000,
      });
    },
    [directoryQuery.data, queryClient],
  );

  return {
    lookupPincode,
    directoryReady: directoryQuery.isSuccess,
    directoryLoading: directoryQuery.isLoading,
  };
}
