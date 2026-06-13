import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import { farmerService } from '@/services/farmer.service';
import type { CreateLandParcelPayload, UpdateLandParcelPayload } from '@/types/farmer';

import { FARMER_PROFILE_KEYS } from './use-farmer-profile';

export const LAND_PARCEL_KEYS = {
  all: ['farmer', 'land'] as const,
  detail: (id: string) => ['farmer', 'land', id] as const,
};

export function useLandParcels(enabled = true) {
  return useQuery({
    queryKey: LAND_PARCEL_KEYS.all,
    queryFn: async () => {
      const { data } = await farmerService.listLandParcels();
      return data.data.items;
    },
    enabled,
  });
}

export function useLandParcel(id: string | null) {
  return useQuery({
    queryKey: LAND_PARCEL_KEYS.detail(id ?? ''),
    queryFn: async () => {
      const { data } = await farmerService.getLandParcel(id!);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useCreateLandParcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLandParcelPayload) => {
      const { data } = await farmerService.createLandParcel(payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LAND_PARCEL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FARMER_PROFILE_KEYS.profile });
    },
  });
}

export function useUpdateLandParcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateLandParcelPayload }) => {
      const { data } = await farmerService.updateLandParcel(id, payload);
      return data.data;
    },
    onSuccess: (parcel) => {
      queryClient.setQueryData(LAND_PARCEL_KEYS.detail(parcel.id), parcel);
      queryClient.invalidateQueries({ queryKey: LAND_PARCEL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FARMER_PROFILE_KEYS.profile });
    },
  });
}

export function useDeleteLandParcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await farmerService.deleteLandParcel(id);
      return id;
    },
    onSuccess: (id) => {
      queryClient.removeQueries({ queryKey: LAND_PARCEL_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: LAND_PARCEL_KEYS.all });
      queryClient.invalidateQueries({ queryKey: FARMER_PROFILE_KEYS.profile });
    },
  });
}

export function getLandParcelError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
