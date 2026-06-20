import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  getApiErrorMessage,
  isForbiddenError,
  isNetworkError,
  isServerError,
} from '@/lib/api-error';
import {
  EXPERT_HOME_LIST_PARAMS,
  EXPERT_ORDERS_DEFAULT_PARAMS,
  EXPERT_REQUESTS_DEFAULT_PARAMS,
  normalizeExpertBooking,
} from '@/lib/expert-marketplace';
import { isActiveExpertOrderStatus } from '@/features/expert/utils/expert-order-display';
import { expertService } from '@/services/expert.service';
import { uploadService } from '@/services/upload.service';
import type {
  ExpertBooking,
  ExpertOrderDocumentAttachPayload,
  ExpertOrderStatusUpdatePayload,
  ListExpertNotificationsParams,
  ListExpertOrdersParams,
  ListExpertRequestsParams,
} from '@/types/expert-booking';

export {
  EXPERT_HOME_LIST_PARAMS,
  EXPERT_ORDERS_DEFAULT_PARAMS,
  EXPERT_REQUESTS_DEFAULT_PARAMS,
} from '@/lib/expert-marketplace';

export const EXPERT_ORDER_KEYS = {
  all: ['expert', 'marketplace'] as const,
  requests: (params?: ListExpertRequestsParams) =>
    ['expert', 'requests', params] as const,
  requestDetail: (id: string) => ['expert', 'requests', 'detail', id] as const,
  orders: (params?: ListExpertOrdersParams) => ['expert', 'orders', params] as const,
  orderDetail: (id: string) => ['expert', 'orders', 'detail', id] as const,
  notifications: (params?: ListExpertNotificationsParams) =>
    ['expert', 'notifications', params] as const,
};

export const EXPERT_UNREAD_NOTIFICATIONS_PARAMS = {
  unreadOnly: true,
  limit: 50,
} as const;

export function invalidateExpertMarketplaceQueries(queryClient: ReturnType<typeof useQueryClient>) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: EXPERT_ORDER_KEYS.all }),
    queryClient.invalidateQueries({ queryKey: ['expert', 'requests'] }),
    queryClient.invalidateQueries({ queryKey: ['expert', 'orders'] }),
    queryClient.invalidateQueries({ queryKey: ['expert', 'notifications'] }),
  ]);
}

export function useExpertRequests(
  params: ListExpertRequestsParams = EXPERT_REQUESTS_DEFAULT_PARAMS,
  options?: { enabled?: boolean; poll?: boolean },
) {
  return useQuery({
    queryKey: EXPERT_ORDER_KEYS.requests(params),
    queryFn: async () => {
      const response = await expertService.listRequests(params);
      return response.data;
    },
    enabled: options?.enabled ?? true,
    refetchInterval: options?.poll ? 15000 : false,
    retry: (failureCount, error) => {
      if (isForbiddenError(error) || isServerError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useExpertRequestsInfinite(options?: { enabled?: boolean; poll?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useInfiniteQuery({
    queryKey: [...EXPERT_ORDER_KEYS.requests(EXPERT_REQUESTS_DEFAULT_PARAMS), 'infinite'],
    queryFn: async ({ pageParam }) => {
      const response = await expertService.listRequests({
        ...EXPERT_REQUESTS_DEFAULT_PARAMS,
        cursor: pageParam,
      });
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled,
    refetchInterval: options?.poll && enabled ? 15000 : false,
    retry: (failureCount, error) => {
      if (isForbiddenError(error) || isServerError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useExpertRequest(
  id: string | null,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: EXPERT_ORDER_KEYS.requestDetail(id ?? ''),
    queryFn: async () => {
      const { data } = await expertService.getRequest(id!);
      return normalizeExpertBooking(data.data.item);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
  });
}

export function useAcceptExpertRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await expertService.acceptRequest(id);
      return data.data.item;
    },
    onSuccess: (order) => {
      const normalized = normalizeExpertBooking(order);
      queryClient.setQueryData(EXPERT_ORDER_KEYS.orderDetail(normalized.id), normalized);
      invalidateExpertMarketplaceQueries(queryClient);
    },
  });
}

export function useExpertOrders(
  params: ListExpertOrdersParams = EXPERT_ORDERS_DEFAULT_PARAMS,
  options?: { enabled?: boolean; poll?: boolean },
) {
  return useQuery({
    queryKey: EXPERT_ORDER_KEYS.orders(params),
    queryFn: async () => {
      const response = await expertService.listOrders(params);
      return response.data;
    },
    enabled: options?.enabled ?? true,
    refetchInterval: options?.poll ? 15000 : false,
    retry: (failureCount, error) => {
      if (isForbiddenError(error) || isServerError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useExpertOrdersInfinite(options?: { enabled?: boolean; poll?: boolean }) {
  const enabled = options?.enabled ?? true;

  return useInfiniteQuery({
    queryKey: [...EXPERT_ORDER_KEYS.orders(EXPERT_ORDERS_DEFAULT_PARAMS), 'infinite'],
    queryFn: async ({ pageParam }) => {
      const response = await expertService.listOrders({
        ...EXPERT_ORDERS_DEFAULT_PARAMS,
        cursor: pageParam,
      });
      return response.data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
    enabled,
    refetchInterval: options?.poll && enabled ? 15000 : false,
    retry: (failureCount, error) => {
      if (isForbiddenError(error) || isServerError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useExpertOrder(
  id: string | null,
  options?: { enabled?: boolean; pollStatus?: boolean },
) {
  const pollStatus = options?.pollStatus ?? false;

  return useQuery({
    queryKey: EXPERT_ORDER_KEYS.orderDetail(id ?? ''),
    queryFn: async () => {
      const { data } = await expertService.getOrder(id!);
      return normalizeExpertBooking(data.data.item);
    },
    enabled: Boolean(id) && (options?.enabled ?? true),
    refetchInterval: (query) => {
      const order = query.state.data;
      if (!order || !pollStatus) {
        return false;
      }
      return isActiveExpertOrderStatus(order.bookingStatus) ? 15000 : false;
    },
  });
}

export function useAdvanceExpertOrderStatus(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ExpertOrderStatusUpdatePayload) => {
      const { data } = await expertService.advanceOrderStatus(orderId, payload);
      return data.data.item;
    },
    onSuccess: (order) => {
      const normalized = normalizeExpertBooking(order);
      queryClient.setQueryData(EXPERT_ORDER_KEYS.orderDetail(normalized.id), normalized);
      invalidateExpertMarketplaceQueries(queryClient);
    },
  });
}

export function useAttachExpertOrderDocument(orderId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      uri,
      contentType,
      label,
    }: {
      uri: string;
      contentType: string;
      label?: string;
    }) => {
      const { data: presignData } = await uploadService.presign('land_doc', contentType);
      const presign = presignData.data;
      await uploadService.uploadToPresignedUrl(presign.uploadUrl, uri, contentType);

      const payload: ExpertOrderDocumentAttachPayload = {
        assetKey: presign.assetKey,
        ...(label?.trim() ? { label: label.trim() } : {}),
      };

      const { data } = await expertService.attachOrderDocument(orderId, payload);
      const order = data.data.item;

      const lastDoc = order.completionDocuments?.[order.completionDocuments.length - 1];
      if (lastDoc && lastDoc.assetKey === presign.assetKey) {
        lastDoc.publicUrl = presign.publicUrl;
      }

      return order;
    },
    onSuccess: (order) => {
      const normalized = normalizeExpertBooking(order);
      queryClient.setQueryData(EXPERT_ORDER_KEYS.orderDetail(normalized.id), normalized);
      invalidateExpertMarketplaceQueries(queryClient);
    },
  });
}

export function mergeExpertDocumentPublicUrls(
  order: ExpertBooking,
  previous?: ExpertBooking | null,
): ExpertBooking {
  if (!order.completionDocuments?.length || !previous?.completionDocuments?.length) {
    return order;
  }

  const urlByKey = new Map(
    previous.completionDocuments
      .filter((doc) => doc.publicUrl)
      .map((doc) => [doc.assetKey, doc.publicUrl!]),
  );

  if (urlByKey.size === 0) {
    return order;
  }

  return {
    ...order,
    completionDocuments: order.completionDocuments.map((doc) => ({
      ...doc,
      publicUrl: doc.publicUrl ?? urlByKey.get(doc.assetKey),
    })),
  };
}

export function useExpertNotifications(
  params?: ListExpertNotificationsParams,
  options?: { enabled?: boolean; poll?: boolean },
) {
  const enabled = options?.enabled ?? true;

  return useQuery({
    queryKey: EXPERT_ORDER_KEYS.notifications(params),
    queryFn: async () => {
      const { data } = await expertService.listNotifications(params);
      return data.data;
    },
    enabled,
    refetchInterval: options?.poll && enabled ? 30000 : false,
  });
}

export function useExpertUnreadNotificationCount(enabled = true) {
  const query = useExpertNotifications(EXPERT_UNREAD_NOTIFICATIONS_PARAMS, {
    enabled,
    poll: enabled,
  });

  return {
    ...query,
    data: (query.data?.items ?? []).filter((item) => !item.readAt).length,
  };
}

export function useMarkExpertNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await expertService.markNotificationRead(id);
      return data.data.notification;
    },
    onSuccess: () => {
      void invalidateExpertMarketplaceQueries(queryClient);
    },
  });
}

export function getExpertOrderError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}

export function getExpertMarketplaceError(
  error: unknown,
  t: (key: string) => string,
): { title: string; message: string } {
  if (isForbiddenError(error)) {
    return {
      title: t('expertDashboard.errors.verificationRequiredTitle'),
      message: t('expertDashboard.errors.verificationRequiredBody'),
    };
  }

  if (isNetworkError(error)) {
    return {
      title: t('expertDashboard.errors.networkTitle'),
      message: t('expertDashboard.errors.networkBody'),
    };
  }

  if (isServerError(error)) {
    return {
      title: t('expertDashboard.errors.serverTitle'),
      message: t('expertDashboard.errors.serverBody'),
    };
  }

  return {
    title: t('expertDashboard.errors.loadTitle'),
    message: getApiErrorMessage(error, t('expertDashboard.errors.loadBody')),
  };
}
