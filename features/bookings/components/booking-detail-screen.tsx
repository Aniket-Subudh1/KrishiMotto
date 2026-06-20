import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { ErrorBanner } from '@/components/auth/auth-screen-layout';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { BookingProgressDots } from '@/features/bookings/components/booking-progress-dots';
import { BookingStatusTimeline } from '@/features/bookings/components/booking-status-timeline';
import { CompletionDocumentsSection } from '@/features/bookings/components/completion-documents-section';
import {
  BOOKING_KEYS,
  mergeDocumentPublicUrls,
  useBooking,
} from '@/features/bookings/hooks/use-booking';
import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import {
  formatBookingDate,
  getBookingStatusColor,
  isServiceIconType,
  translateBookingStatus,
} from '@/features/home/utils/booking-display';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateServiceTitle } from '@/lib/booking-i18n';
import { formatPaise } from '@/lib/currency';
import { useAuthStore } from '@/stores/auth.store';
import type { Booking } from '@/types/booking';

export function BookingDetailScreen() {
  const { t, locale } = useAppLocale();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { id } = useLocalSearchParams<{ id: string }>();
  const bookingId = typeof id === 'string' ? id : '';

  const cached = queryClient.getQueryData<Booking>(BOOKING_KEYS.detail(bookingId));

  const { data: fetched, isLoading, isRefetching, refetch, error } = useBooking(bookingId || null, {
    pollStatus: true,
  });

  const booking = useMemo(
    () => (fetched ? mergeDocumentPublicUrls(fetched, cached) : fetched),
    [cached, fetched],
  );

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  const iconType =
    booking && isServiceIconType(booking.serviceIconType) ? booking.serviceIconType : null;
  const iconStyle = getServiceIconStyle(iconType ?? 'CROP_CALENDAR');
  const title = booking
    ? iconType
      ? translateServiceTitle(t, iconType, booking.serviceTitle)
      : booking.serviceTitle
    : t('bookingDetail.title');

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

        {booking ? (
          <View className="mt-5 rounded-2xl bg-white/15 px-4 py-4">
            <BookingProgressDots booking={booking} t={t} />
          </View>
        ) : null}
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Palette.indiaGreen} />
        </View>
      ) : error || !booking ? (
        <View className="flex-1 px-5 pt-5">
          <ErrorBanner message={t('bookingDetail.loadError')} />
          <Button size="lg" className="mt-4" onPress={() => router.back()}>
            {t('bookingDetail.back')}
          </Button>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-5"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
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
            <Text className="mt-3 text-[13px] text-muted">
              {t('home.dashboard.requestedOn').replace(
                '{{date}}',
                formatBookingDate(booking.createdAt, locale),
              )}
            </Text>
            {booking.scheduledDate ? (
              <Text className="mt-1 text-[13px] text-muted">
                {t('bookingDetail.scheduledFor').replace(
                  '{{date}}',
                  formatBookingDate(booking.scheduledDate, locale),
                )}
              </Text>
            ) : null}
          </View>

          <View className="mt-5 rounded-2xl border border-border bg-white p-4">
            <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              {t('bookingDetail.timelineTitle')}
            </Text>
            <View className="mt-4">
              <BookingStatusTimeline booking={booking} t={t} locale={locale} />
            </View>
          </View>

          <View className="mt-5">
            <CompletionDocumentsSection booking={booking} t={t} />
          </View>

          {booking.bookingStatus === 'PENDING_PAYMENT' ? (
            <Button
              size="lg"
              className="mt-5 w-full"
              onPress={() =>
                router.push({
                  pathname: '/payment/checkout',
                  params: { bookingId: booking.id, orderId: booking.orderId },
                })
              }
            >
              {t('bookingDetail.continuePayment')}
            </Button>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}
