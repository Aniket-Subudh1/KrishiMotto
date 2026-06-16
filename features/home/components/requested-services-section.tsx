import { Ionicons } from '@expo/vector-icons';
import type { TFunction } from 'i18next';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import { useHomeBookings } from '@/features/home/hooks/use-bookings';
import {
  formatBookingDate,
  getBookingRoute,
  getBookingStatusColor,
  isServiceIconType,
  translateBookingStatus,
} from '@/features/home/utils/booking-display';
import { formatPaise } from '@/lib/currency';
import { translateServiceTitle } from '@/lib/booking-i18n';
import { Palette } from '@/constants/theme';
import type { Booking } from '@/types/booking';

type RequestedServicesSectionProps = {
  t: (key: string) => string;
  locale: string;
};

export function RequestedServicesSection({ t, locale }: RequestedServicesSectionProps) {
  const { data, isLoading } = useHomeBookings();
  const bookings = data?.items.filter((booking) => booking.bookingStatus !== 'CANCELLED') ?? [];

  if (isLoading) {
    return (
      <View className="mt-6 px-5">
        <Text className="mb-3 text-[18px] font-bold text-indigo">
          {t('home.dashboard.requestedServicesTitle')}
        </Text>
        <View className="items-center py-6">
          <ActivityIndicator size="small" color={Palette.indiaGreen} />
        </View>
      </View>
    );
  }

  if (!bookings.length) {
    return null;
  }

  return (
    <View className="mt-6 px-5">
      <Text className="mb-3 text-[18px] font-bold text-indigo">
        {t('home.dashboard.requestedServicesTitle')}
      </Text>
      <View className="gap-3">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} t={t} locale={locale} />
        ))}
      </View>
    </View>
  );
}

function BookingCard({
  booking,
  t,
  locale,
}: {
  booking: Booking;
  t: (key: string) => string;
  locale: string;
}) {
  const iconType = isServiceIconType(booking.serviceIconType) ? booking.serviceIconType : null;
  const iconStyle = getServiceIconStyle(iconType ?? 'CROP_CALENDAR');
  const title = iconType
    ? translateServiceTitle(t as TFunction, iconType, booking.serviceTitle)
    : booking.serviceTitle;
  const statusLabel = translateBookingStatus(t, booking.bookingStatus);
  const statusColor = getBookingStatusColor(booking.bookingStatus);
  const dateLabel = formatBookingDate(booking.createdAt, locale);

  function handlePress() {
    const route = getBookingRoute(booking);
    router.push(route);
  }

  return (
    <Pressable onPress={handlePress}>
      <View
        className="flex-row items-center gap-4 overflow-hidden rounded-2xl border border-border bg-white p-4"
        style={{
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: iconStyle.iconBg }}
        >
          <Ionicons name={iconStyle.icon} size={22} color={iconStyle.iconColor} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-[16px] font-bold text-indigo" numberOfLines={1}>
            {title}
          </Text>
          <Text className="mt-1 text-[13px] text-muted" numberOfLines={1}>
            {t('home.dashboard.requestedOn').replace('{{date}}', dateLabel)}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <View
              className="rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: `${statusColor}18` }}
            >
              <Text className="text-[11px] font-semibold" style={{ color: statusColor }}>
                {statusLabel}
              </Text>
            </View>
            <Text className="text-[13px] font-semibold text-indigo">
              {formatPaise(booking.pricing.totalPaise)}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </View>
    </Pressable>
  );
}
