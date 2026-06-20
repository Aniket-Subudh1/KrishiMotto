import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useExpertProfile } from '@/features/expert/hooks/use-expert-auth';
import {
  EXPERT_UNREAD_NOTIFICATIONS_PARAMS,
  invalidateExpertMarketplaceQueries,
  useExpertNotifications,
  useExpertOrdersInfinite,
  useExpertRequestsInfinite,
} from '@/features/expert/hooks/use-expert-orders';
import { useManualRefresh } from '@/hooks/use-manual-refresh';
import { useAuthStore } from '@/stores/auth.store';
import type { ExpertProfile } from '@/types/expert';
import type { ExpertBooking } from '@/types/expert-booking';

const PREVIEW_LIMIT = 2;

type ExpertHomeContextValue = {
  profile?: ExpertProfile;
  profileLoading: boolean;
  canLoadRequests: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  openRequestCount: number;
  activeOrderCount: number;
  unreadNotificationCount: number;
  hasMoreRequests: boolean;
  hasMoreOrders: boolean;
  requestPreview: ExpertBooking[];
  orderPreview: ExpertBooking[];
  requestsLoading: boolean;
  ordersLoading: boolean;
  requestsError: unknown;
  ordersError: unknown;
  refetchRequests: () => void;
  refetchOrders: () => void;
  registerPollingScope: (scope: string) => () => void;
};

const ExpertHomeContext = createContext<ExpertHomeContextValue | null>(null);

export function ExpertHomeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const isExpert = useAuthStore((s) => s.user?.role === 'EXPERT');
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const enabled = isExpert && profileCompleted;
  const [pollingScopes, setPollingScopes] = useState<Set<string>>(() => new Set());

  const registerPollingScope = useCallback((scope: string) => {
    setPollingScopes((prev) => {
      const next = new Set(prev);
      next.add(scope);
      return next;
    });

    return () => {
      setPollingScopes((prev) => {
        const next = new Set(prev);
        next.delete(scope);
        return next;
      });
    };
  }, []);

  const profileQuery = useExpertProfile(enabled);
  const canLoadRequests = profileQuery.data?.canAcceptOrders === true;
  const marketplaceEnabled = enabled && canLoadRequests;
  const pollRequests =
    marketplaceEnabled &&
    (pollingScopes.has('overview') || pollingScopes.has('requests'));
  const pollOrders =
    enabled && (pollingScopes.has('overview') || pollingScopes.has('orders'));
  const pollNotifications =
    enabled &&
    (pollingScopes.has('overview') || pollingScopes.has('notifications'));

  const requestsQuery = useExpertRequestsInfinite({
    enabled: marketplaceEnabled,
    poll: pollRequests,
  });
  const ordersQuery = useExpertOrdersInfinite({
    enabled,
    poll: pollOrders,
  });
  const unreadNotificationsQuery = useExpertNotifications(EXPERT_UNREAD_NOTIFICATIONS_PARAMS, {
    enabled,
    poll: pollNotifications,
  });

  const requestsFirstPage = requestsQuery.data?.pages[0];
  const ordersFirstPage = ordersQuery.data?.pages[0];
  const requestItems = requestsFirstPage?.items ?? [];
  const orderItems = ordersFirstPage?.items ?? [];
  const hasMoreRequests = requestsFirstPage?.hasMore ?? false;
  const hasMoreOrders = ordersFirstPage?.hasMore ?? false;
  const unreadNotificationCount = (unreadNotificationsQuery.data?.items ?? []).filter(
    (item) => !item.readAt,
  ).length;

  const refreshData = useCallback(async () => {
    await Promise.all([
      profileQuery.refetch(),
      invalidateExpertMarketplaceQueries(queryClient),
    ]);
  }, [profileQuery, queryClient]);

  const { isRefreshing, onRefresh } = useManualRefresh(refreshData);

  const value = useMemo(
    () => ({
      profile: profileQuery.data,
      profileLoading: profileQuery.isLoading,
      canLoadRequests,
      isLoading: profileQuery.isLoading,
      isRefreshing,
      onRefresh,
      openRequestCount: requestItems.length,
      activeOrderCount: orderItems.length,
      unreadNotificationCount,
      hasMoreRequests,
      hasMoreOrders,
      requestPreview: requestItems.slice(0, PREVIEW_LIMIT),
      orderPreview: orderItems.slice(0, PREVIEW_LIMIT),
      requestsLoading: marketplaceEnabled && requestsQuery.isLoading,
      ordersLoading: ordersQuery.isLoading,
      requestsError: requestsQuery.error,
      ordersError: ordersQuery.error,
      refetchRequests: () => void requestsQuery.refetch(),
      refetchOrders: () => void ordersQuery.refetch(),
      registerPollingScope,
    }),
    [
      canLoadRequests,
      hasMoreOrders,
      hasMoreRequests,
      isRefreshing,
      marketplaceEnabled,
      onRefresh,
      orderItems,
      ordersQuery.error,
      ordersQuery.isLoading,
      ordersQuery.refetch,
      profileQuery.data,
      profileQuery.isLoading,
      registerPollingScope,
      requestItems,
      requestsQuery.error,
      requestsQuery.isLoading,
      requestsQuery.refetch,
      unreadNotificationCount,
    ],
  );

  return <ExpertHomeContext.Provider value={value}>{children}</ExpertHomeContext.Provider>;
}

export function useExpertHome() {
  const context = useContext(ExpertHomeContext);
  if (!context) {
    throw new Error('useExpertHome must be used within ExpertHomeProvider');
  }
  return context;
}

export function useOptionalExpertHome() {
  return useContext(ExpertHomeContext);
}

/** Enables marketplace polling only while the calling screen is focused. */
export function useExpertPollingScope(scope: string) {
  const { registerPollingScope } = useExpertHome();

  useFocusEffect(
    useCallback(() => registerPollingScope(scope), [registerPollingScope, scope]),
  );
}
