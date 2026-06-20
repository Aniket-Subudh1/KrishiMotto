import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { BookingProgressDots } from '@/features/bookings/components/booking-progress-dots';
import { BookingStatusTimeline } from '@/features/bookings/components/booking-status-timeline';
import { ExpertCompletionDocumentsSection } from '@/features/expert/components/expert-completion-documents-section';
import {
  EXPERT_ORDER_KEYS,
  getExpertMarketplaceError,
  getExpertOrderError,
  mergeExpertDocumentPublicUrls,
  useAcceptExpertRequest,
  useAdvanceExpertOrderStatus,
  useExpertOrder,
  useExpertRequest,
} from '@/features/expert/hooks/use-expert-orders';
import {
  ExpertMarketplaceError,
  ExpertMarketplaceLoading,
} from '@/features/expert/components/expert-marketplace-states';
import {
  formatDistanceKm,
  formatServiceLocation,
  formatSlaRemaining,
  getExpertStatusActionKey,
  toProgressBooking,
} from '@/features/expert/utils/expert-order-display';
import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import {
  formatBookingDate,
  getBookingStatusColor,
  isServiceIconType,
  translateBookingStatus,
} from '@/features/home/utils/booking-display';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useManualRefresh } from '@/hooks/use-manual-refresh';
import { translateServiceTitle } from '@/lib/booking-i18n';
import { formatPaise } from '@/lib/currency';
import { useAuthStore } from '@/stores/auth.store';
import type { Booking } from '@/types/booking';
import type { ExpertBooking } from '@/types/expert-booking';

export function ExpertOrderDetailScreen() {
  const { t, locale } = useAppLocale();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const bookingId = typeof id === 'string' ? id : '';
  const isRequest = source === 'request';
  const [actionError, setActionError] = useState<string | null>(null);

  const cachedOrder = queryClient.getQueryData<ExpertBooking>(
    EXPERT_ORDER_KEYS.orderDetail(bookingId),
  );
  const cachedRequest = queryClient.getQueryData<ExpertBooking>(
    EXPERT_ORDER_KEYS.requestDetail(bookingId),
  );

  const {
    data: fetchedOrder,
    isLoading: orderLoading,
    refetch: refetchOrder,
    error: orderError,
  } = useExpertOrder(isRequest ? null : bookingId || null, { pollStatus: true });

  const {
    data: fetchedRequest,
    isLoading: requestLoading,
    refetch: refetchRequest,
    error: requestError,
  } = useExpertRequest(isRequest ? bookingId || null : null);

  const refreshDetail = useCallback(
    () => (isRequest ? refetchRequest() : refetchOrder()),
    [isRequest, refetchOrder, refetchRequest],
  );
  const { isRefreshing, onRefresh } = useManualRefresh(refreshDetail);

  const acceptRequest = useAcceptExpertRequest();
  const advanceStatus = useAdvanceExpertOrderStatus(bookingId);

  const fetched = isRequest ? fetchedRequest : fetchedOrder;
  const cached = isRequest ? cachedRequest : cachedOrder;
  const isLoading = isRequest ? requestLoading : orderLoading;
  const error = isRequest ? requestError : orderError;

  const booking = useMemo(
    () => (fetched ? mergeExpertDocumentPublicUrls(fetched, cached) : fetched),
    [cached, fetched],
  );

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'EXPERT') {
    return <Redirect href="/(tabs)" />;
  }

  const iconType =
    booking && isServiceIconType(booking.serviceIconType) ? booking.serviceIconType : null;
  const iconStyle = getServiceIconStyle(iconType ?? 'CROP_CALENDAR');
  const title = booking
    ? iconType
      ? translateServiceTitle(t, iconType, booking.serviceTitle)
      : booking.serviceTitle
    : t('expertDashboard.orderDetail.title');
  const locationLabel = booking ? formatServiceLocation(booking) : '';
  const distanceLabel = booking ? formatDistanceKm(booking.distanceKm) : null;
  const slaLabel = booking ? formatSlaRemaining(booking.slaRemainingMinutes) : null;
  const progressBooking = booking ? toProgressBooking(booking) : null;

  async function handleAccept() {
    if (!booking) return;
    setActionError(null);

    try {
      const order = await acceptRequest.mutateAsync(booking.id);
      router.replace(`/expert-orders/${order.id}` as `/expert-orders/${string}`);
    } catch (acceptError) {
      setActionError(getExpertOrderError(acceptError, t('expertDashboard.orderDetail.acceptError')));
    }
  }

  async function handleAdvanceStatus() {
    if (!booking?.nextStep) return;
    setActionError(null);

    try {
      await advanceStatus.mutateAsync({ status: booking.nextStep });
    } catch (statusError) {
      setActionError(
        getExpertOrderError(statusError, t('expertDashboard.orderDetail.statusError')),
      );
    }
  }

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            accessibilityRole="button"
          >
            <AppIcon name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <AppIcon name={iconStyle.icon} size={24} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[24px] font-bold text-white">{title}</Text>
            <Text className="mt-0.5 text-[14px] text-white/85">
              {booking?.orderId ?? t('bookingDetail.loading')}
            </Text>
          </View>
        </View>

        {progressBooking && !isRequest ? (
          <View className="mt-5 rounded-2xl bg-white/15 px-4 py-4">
            <BookingProgressDots booking={progressBooking} t={t} />
          </View>
        ) : null}
      </LinearGradient>

      {isLoading ? (
        <ExpertMarketplaceLoading />
      ) : error || !booking ? (
        <View className="flex-1 px-5 pt-5">
          <ExpertMarketplaceError
            t={t}
            title={
              error
                ? getExpertMarketplaceError(error, t).title
                : t('expertDashboard.errors.loadTitle')
            }
            message={
              error
                ? getExpertMarketplaceError(error, t).message
                : t('expertDashboard.errors.loadBody')
            }
            retryLabel={t('expertDashboard.retry')}
            onRetry={() => void (isRequest ? refetchRequest() : refetchOrder())}
            secondaryActionLabel={t('bookingDetail.back')}
            onSecondaryAction={() => router.back()}
          />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-5"
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          <View className="rounded-2xl border border-border bg-white p-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="text-[12px] uppercase tracking-wide text-muted">
                  {t('bookingDetail.amount')}
                </Text>
                <Text className="text-[22px] font-bold text-indigo">
                  {formatPaise(booking.pricing.totalPaise)}
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: `${getBookingStatusColor(booking.bookingStatus)}18` }}
              >
                <Text
                  className="text-[12px] font-semibold"
                  style={{ color: getBookingStatusColor(booking.bookingStatus) }}
                >
                  {translateBookingStatus(t, booking.bookingStatus)}
                </Text>
              </View>
            </View>

            {locationLabel ? (
              <View className="mt-3 flex-row items-start gap-1.5">
                <AppIcon name="map-marker-outline" size={14} color="#94A3B8" style={{ marginTop: 2 }} />
                <Text className="flex-1 text-[13px] leading-5 text-muted" numberOfLines={3}>
                  {locationLabel}
                  {distanceLabel
                    ? ` · ${t('expertDashboard.openRequests.distance').replace('{{distance}}', distanceLabel)}`
                    : ''}
                </Text>
              </View>
            ) : null}

            {booking.areaAcres != null ? (
              <Text className="mt-2 text-[13px] text-muted">
                {t('expertDashboard.orderDetail.area').replace(
                  '{{area}}',
                  String(booking.areaAcres),
                )}
              </Text>
            ) : null}

            <Text className="mt-2 text-[13px] text-muted">
              {t('home.dashboard.requestedOn').replace(
                '{{date}}',
                formatBookingDate(booking.createdAt, locale),
              )}
            </Text>

            {slaLabel ? (
              <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-amber-50 px-3 py-2">
                <AppIcon name="clock-outline" size={16} color="#D97706" />
                <Text className="flex-1 text-[13px] font-medium text-amber-800">
                  {t('expertDashboard.orderDetail.slaRemaining').replace('{{time}}', slaLabel)}
                </Text>
              </View>
            ) : null}
          </View>

          {!isRequest ? (
            <View className="mt-5 rounded-2xl border border-border bg-white p-4">
              <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
                {t('bookingDetail.timelineTitle')}
              </Text>
              <View className="mt-4">
                <BookingStatusTimeline booking={progressBooking as Booking} t={t} locale={locale} />
              </View>
            </View>
          ) : null}

          {!isRequest ? (
            <View className="mt-5">
              <ExpertCompletionDocumentsSection order={booking} t={t} />
            </View>
          ) : null}

          {actionError ? (
            <Text className="mt-4 text-[13px] text-red-500">{actionError}</Text>
          ) : null}

          {isRequest ? (
            <Button
              size="lg"
              className="mt-5 w-full"
              loading={acceptRequest.isPending}
              onPress={() => void handleAccept()}
            >
              {t('expertDashboard.orderDetail.accept')}
            </Button>
          ) : booking.nextStep ? (
            <Button
              size="lg"
              className="mt-5 w-full"
              loading={advanceStatus.isPending}
              onPress={() => void handleAdvanceStatus()}
            >
              {t(getExpertStatusActionKey(booking.nextStep))}
            </Button>
          ) : null}

          {booking.nextStep === 'COMPLETED' &&
          (booking.completionDocuments?.length ?? 0) === 0 ? (
            <Text className="mt-3 text-[13px] leading-5 text-muted">
              {t('expertDashboard.orderDetail.completeRequiresDocument')}
            </Text>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
