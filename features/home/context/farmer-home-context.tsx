import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { LandParcelSheet } from '@/features/home/components/land-parcel-sheet';
import { useFarmerProfile } from '@/features/farmer/hooks/use-farmer-profile';
import { useLandParcels } from '@/features/farmer/hooks/use-land-parcel';
import { CATALOG_KEYS } from '@/features/home/hooks/use-catalog';
import { invalidateRequestedServicesQueries } from '@/features/home/utils/requested-services';
import { useAuthStore } from '@/stores/auth.store';
import type { FarmerProfile } from '@/types/farmer';
import type { LandParcel } from '@/types/farmer';

type FarmerHomeContextValue = {
  profile?: FarmerProfile;
  parcels: LandParcel[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  selectedParcelId: string | null;
  setSelectedParcelId: (id: string | null) => void;
};

const FarmerHomeContext = createContext<FarmerHomeContextValue | null>(null);

export function FarmerHomeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);
  const isFarmer = useAuthStore((s) => s.user?.role === 'FARMER');
  const profileQuery = useFarmerProfile(isFarmer);
  const parcelsQuery = useLandParcels(isFarmer);

  const isRefreshing =
    (profileQuery.isRefetching && !profileQuery.isLoading) ||
    (parcelsQuery.isRefetching && !parcelsQuery.isLoading);

  const onRefresh = useCallback(() => {
    profileQuery.refetch();
    parcelsQuery.refetch();
    queryClient.invalidateQueries({ queryKey: CATALOG_KEYS.services });
    void invalidateRequestedServicesQueries(queryClient);
  }, [parcelsQuery, profileQuery, queryClient]);

  const value = useMemo(
    () => ({
      profile: profileQuery.data,
      parcels: parcelsQuery.data ?? [],
      isLoading: profileQuery.isLoading || parcelsQuery.isLoading,
      isRefreshing,
      onRefresh,
      selectedParcelId,
      setSelectedParcelId,
    }),
    [
      isRefreshing,
      onRefresh,
      parcelsQuery.data,
      parcelsQuery.isLoading,
      profileQuery.data,
      profileQuery.isLoading,
      selectedParcelId,
    ],
  );

  return (
    <FarmerHomeContext.Provider value={value}>
      {children}
      <LandParcelSheet
        parcelId={selectedParcelId}
        visible={Boolean(selectedParcelId)}
        onClose={() => setSelectedParcelId(null)}
      />
    </FarmerHomeContext.Provider>
  );
}

export function useFarmerHome() {
  const context = useContext(FarmerHomeContext);
  if (!context) {
    throw new Error('useFarmerHome must be used within FarmerHomeProvider');
  }
  return context;
}
