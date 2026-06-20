import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { BookingProgressDots } from '@/features/bookings/components/booking-progress-dots';
import {
  formatServiceLocation,
  formatDistanceKm,
  formatSlaRemaining,
  getExpertOrderDetailRoute,
  getExpertRequestDetailRoute,
  toProgressBooking,
} from '@/features/expert/utils/expert-order-display';
import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import {
  formatBookingDate,
  getBookingStatusColor,
  isServiceIconType,
  translateBookingStatus,
} from '@/features/home/utils/booking-display';
import { translateServiceTitle, type TranslateFn } from '@/lib/booking-i18n';
import { formatPaise } from '@/lib/currency';
import { Palette } from '@/constants/theme';
import type { ExpertBooking } from '@/types/expert-booking';

type ExpertOrderCardProps = {
  booking: ExpertBooking;
  t: TranslateFn;
  locale: string;
  variant?: 'request' | 'order';
};

export function ExpertOrderCard({
  booking,
  t,
  locale,
  variant = 'order',
}: ExpertOrderCardProps) {
  const iconType = isServiceIconType(booking.serviceIconType) ? booking.serviceIconType : null;
  const iconStyle = getServiceIconStyle(iconType ?? 'CROP_CALENDAR');
  const title = iconType
    ? translateServiceTitle(t, iconType, booking.serviceTitle)
    : booking.serviceTitle;
  const statusLabel = translateBookingStatus(t, booking.bookingStatus);
  const statusColor = getBookingStatusColor(booking.bookingStatus);
  const dateLabel = formatBookingDate(booking.createdAt, locale);
  const locationLabel = formatServiceLocation(booking);
  const distanceLabel = formatDistanceKm(booking.distanceKm);
  const slaLabel = formatSlaRemaining(booking.slaRemainingMinutes);

  function handlePress() {
    router.push(
      variant === 'request'
        ? getExpertRequestDetailRoute(booking.id)
        : getExpertOrderDetailRoute(booking.id),
    );
  }

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      <View
        className="flex-row items-start gap-4 rounded-2xl bg-white p-4"
        style={{
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
          borderWidth: 1,
          borderColor: 'rgba(226, 232, 240, 0.8)',
        }}
      >
        <View
          className="h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: iconStyle.iconBg }}
        >
          <AppIcon name={iconStyle.icon} size={24} color={iconStyle.iconColor} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-bold leading-5 text-indigo" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-0.5 text-[12px] text-muted" numberOfLines={1}>
            {booking.orderId}
          </Text>
          {locationLabel ? (
            <View className="mt-1 flex-row items-start gap-1.5">
              <AppIcon name="map-marker-outline" size={13} color="#94A3B8" style={{ marginTop: 2 }} />
              <Text className="flex-1 text-[12px] leading-4 text-muted" numberOfLines={2}>
                {locationLabel}
                {distanceLabel
                  ? ` · ${t('expertDashboard.openRequests.distance').replace('{{distance}}', distanceLabel)}`
                  : ''}
              </Text>
            </View>
          ) : null}
          <View className="mt-1 flex-row items-start gap-1.5">
            <AppIcon name="calendar-clock" size={13} color="#94A3B8" style={{ marginTop: 2 }} />
            <Text className="flex-1 text-[12px] leading-4 text-muted" numberOfLines={2}>
              {t('home.dashboard.requestedOn').replace('{{date}}', dateLabel)}
            </Text>
          </View>
          <View className="mt-2.5 flex-row flex-wrap items-center gap-2">
            <View
              className="rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: `${statusColor}18` }}
            >
              <Text
                className="text-[11px] font-semibold leading-4"
                style={{ color: statusColor }}
                numberOfLines={2}
              >
                {statusLabel}
              </Text>
            </View>
            <Text className="text-[13px] font-bold text-indigo">
              {formatPaise(booking.pricing?.totalPaise ?? 0)}
            </Text>
            {slaLabel ? (
              <View className="flex-row items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5">
                <AppIcon name="clock-outline" size={12} color="#D97706" />
                <Text className="text-[11px] font-semibold text-amber-700">{slaLabel}</Text>
              </View>
            ) : null}
          </View>
          {variant === 'order' ? (
            <View className="mt-3">
              <BookingProgressDots booking={toProgressBooking(booking)} t={t} compact />
            </View>
          ) : null}
          {(booking.completionDocuments?.length ?? 0) > 0 ? (
            <Text className="mt-2 text-[12px] font-medium text-india-green">
              {t('bookingDetail.documentCount').replace(
                '{{count}}',
                String(booking.completionDocuments?.length ?? 0),
              )}
            </Text>
          ) : null}
        </View>

        <View
          className="h-8 w-8 shrink-0 items-center justify-center self-start rounded-full"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
        >
          <AppIcon name="chevron-right" size={20} color={Palette.indiaGreen} />
        </View>
      </View>
    </Pressable>
  );
}
