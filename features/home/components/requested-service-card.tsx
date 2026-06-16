import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import {
  formatBookingDate,
  getBookingRoute,
  getBookingStatusColor,
  isServiceIconType,
  translateBookingStatus,
} from '@/features/home/utils/booking-display';
import { getStorageRoute } from '@/features/home/utils/storage-display';
import { formatPaise } from '@/lib/currency';
import {
  translateServiceTitle,
  translateStorageStatus,
  type TranslateFn,
} from '@/lib/booking-i18n';
import { Palette } from '@/constants/theme';
import type { RequestedServiceItem } from '@/features/home/utils/requested-services';
import type { Booking } from '@/types/booking';
import type { StorageRequest } from '@/types/storage';

export function BookingCard({
  booking,
  t,
  locale,
}: {
  booking: Booking;
  t: TranslateFn;
  locale: string;
}) {
  const iconType = isServiceIconType(booking.serviceIconType) ? booking.serviceIconType : null;
  const iconStyle = getServiceIconStyle(iconType ?? 'CROP_CALENDAR');
  const title = iconType
    ? translateServiceTitle(t, iconType, booking.serviceTitle)
    : booking.serviceTitle;
  const statusLabel = translateBookingStatus(t, booking.bookingStatus);
  const statusColor = getBookingStatusColor(booking.bookingStatus);
  const dateLabel = formatBookingDate(booking.createdAt, locale);

  function handlePress() {
    router.push(getBookingRoute(booking));
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
              <Text className="text-[11px] font-semibold leading-4" style={{ color: statusColor }} numberOfLines={2}>
                {statusLabel}
              </Text>
            </View>
            <Text className="text-[13px] font-bold text-indigo">
              {formatPaise(booking.pricing.totalPaise)}
            </Text>
          </View>
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

export function StorageCard({
  request,
  t,
  locale,
}: {
  request: StorageRequest;
  t: TranslateFn;
  locale: string;
}) {
  const iconStyle = getServiceIconStyle('STORAGE');
  const title = translateServiceTitle(t, 'STORAGE', 'Storage');
  const statusLabel = translateStorageStatus(t, request.status);
  const statusColor =
    request.status === 'PENDING_PAYMENT' ? '#F59E0B' : Palette.indiaGreen;
  const dateLabel = formatBookingDate(request.createdAt, locale);

  function handlePress() {
    router.push(getStorageRoute(request));
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
              <Text className="text-[11px] font-semibold leading-4" style={{ color: statusColor }} numberOfLines={2}>
                {statusLabel}
              </Text>
            </View>
            <Text className="text-[13px] font-bold text-indigo">
              {formatPaise(request.pricing.totalPaise)}
            </Text>
          </View>
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

export function RequestedServiceListItem({
  item,
  t,
  locale,
}: {
  item: RequestedServiceItem;
  t: TranslateFn;
  locale: string;
}) {
  if (item.kind === 'booking') {
    return <BookingCard booking={item.booking} t={t} locale={locale} />;
  }
  return <StorageCard request={item.request} t={t} locale={locale} />;
}
