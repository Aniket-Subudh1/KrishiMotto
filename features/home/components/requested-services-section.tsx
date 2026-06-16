import type { TFunction } from 'i18next';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import { useHomeBookings } from '@/features/home/hooks/use-bookings';
import { useHomeStorageRequests } from '@/features/home/hooks/use-storage-requests';
import {
  formatBookingDate,
  getBookingRoute,
  getBookingStatusColor,
  isServiceIconType,
  translateBookingStatus,
} from '@/features/home/utils/booking-display';
import {
  getStorageRoute,
  isActiveStorageRequest,
} from '@/features/home/utils/storage-display';
import { formatPaise } from '@/lib/currency';
import { translateServiceTitle, translateStorageStatus } from '@/lib/booking-i18n';
import { Palette } from '@/constants/theme';
import type { Booking } from '@/types/booking';
import type { StorageRequest } from '@/types/storage';

type RequestedServicesSectionProps = {
  t: (key: string) => string;
  locale: string;
};

type RequestedServiceItem =
  | { kind: 'booking'; createdAt: string; booking: Booking }
  | { kind: 'storage'; createdAt: string; request: StorageRequest };

export function RequestedServicesSection({ t, locale }: RequestedServicesSectionProps) {
  const { data: bookingData, isLoading: bookingsLoading } = useHomeBookings();
  const { data: storageData, isLoading: storageLoading } = useHomeStorageRequests();

  const bookings = bookingData?.items.filter((booking) => booking.bookingStatus !== 'CANCELLED') ?? [];
  const storageRequests =
    storageData?.items.filter((request) => isActiveStorageRequest(request)) ?? [];

  const items: RequestedServiceItem[] = [
    ...bookings.map((booking) => ({
      kind: 'booking' as const,
      createdAt: booking.createdAt,
      booking,
    })),
    ...storageRequests.map((request) => ({
      kind: 'storage' as const,
      createdAt: request.createdAt,
      request,
    })),
  ].sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  if (bookingsLoading || storageLoading) {
    return (
      <View className="mt-7 px-5">
        <View className="mb-4 flex-row items-center gap-2.5">
          <View
            className="h-8 w-8 items-center justify-center rounded-xl"
            style={{ backgroundColor: 'rgba(26, 54, 93, 0.08)' }}
          >
            <AppIcon name="clipboard-text-clock-outline" size={18} color={Palette.indigo} />
          </View>
          <Text className="text-[18px] font-bold text-indigo">
            {t('home.dashboard.requestedServicesTitle')}
          </Text>
        </View>
        <View className="items-center py-6">
          <ActivityIndicator size="small" color={Palette.indiaGreen} />
        </View>
      </View>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <View className="mt-7 px-5">
      <View className="mb-4 flex-row items-center gap-2.5">
        <View
          className="h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(26, 54, 93, 0.08)' }}
        >
          <AppIcon name="clipboard-text-clock-outline" size={18} color={Palette.indigo} />
        </View>
        <Text className="flex-1 text-[18px] font-bold text-indigo">
          {t('home.dashboard.requestedServicesTitle')}
        </Text>
        <View
          className="min-w-[26px] items-center justify-center rounded-full px-2 py-0.5"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.12)' }}
        >
          <Text className="text-[12px] font-bold text-india-green">{items.length}</Text>
        </View>
      </View>
      <View className="gap-3">
        {items.map((item) =>
          item.kind === 'booking' ? (
            <BookingCard key={`booking-${item.booking.id}`} booking={item.booking} t={t} locale={locale} />
          ) : (
            <StorageCard key={`storage-${item.request.id}`} request={item.request} t={t} locale={locale} />
          ),
        )}
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
    <Pressable onPress={handlePress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      <View
        className="flex-row items-center gap-4 overflow-hidden rounded-2xl bg-white p-4"
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
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: iconStyle.iconBg }}
        >
          <AppIcon name={iconStyle.icon} size={24} color={iconStyle.iconColor} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-bold text-indigo" numberOfLines={1}>
            {title}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <AppIcon name="calendar-clock" size={13} color="#94A3B8" />
            <Text className="text-[12px] text-muted" numberOfLines={1}>
              {t('home.dashboard.requestedOn').replace('{{date}}', dateLabel)}
            </Text>
          </View>
          <View className="mt-2.5 flex-row items-center gap-2">
            <View
              className="rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: `${statusColor}18` }}
            >
              <Text className="text-[11px] font-semibold" style={{ color: statusColor }}>
                {statusLabel}
              </Text>
            </View>
            <Text className="text-[13px] font-bold text-indigo">
              {formatPaise(booking.pricing.totalPaise)}
            </Text>
          </View>
        </View>

        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
        >
          <AppIcon name="chevron-right" size={20} color={Palette.indiaGreen} />
        </View>
      </View>
    </Pressable>
  );
}

function StorageCard({
  request,
  t,
  locale,
}: {
  request: StorageRequest;
  t: (key: string) => string;
  locale: string;
}) {
  const iconStyle = getServiceIconStyle('STORAGE');
  const title = translateServiceTitle(t as TFunction, 'STORAGE', 'Storage');
  const statusLabel = translateStorageStatus(t as TFunction, request.status);
  const statusColor =
    request.status === 'PENDING_PAYMENT' ? '#F59E0B' : Palette.indiaGreen;
  const dateLabel = formatBookingDate(request.createdAt, locale);

  function handlePress() {
    const route = getStorageRoute(request);
    router.push(route);
  }

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      <View
        className="flex-row items-center gap-4 overflow-hidden rounded-2xl bg-white p-4"
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
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: iconStyle.iconBg }}
        >
          <AppIcon name={iconStyle.icon} size={24} color={iconStyle.iconColor} />
        </View>

        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-bold text-indigo" numberOfLines={1}>
            {title}
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <AppIcon name="calendar-clock" size={13} color="#94A3B8" />
            <Text className="text-[12px] text-muted" numberOfLines={1}>
              {t('home.dashboard.requestedOn').replace('{{date}}', dateLabel)}
            </Text>
          </View>
          <View className="mt-2.5 flex-row items-center gap-2">
            <View
              className="rounded-full px-2.5 py-0.5"
              style={{ backgroundColor: `${statusColor}18` }}
            >
              <Text className="text-[11px] font-semibold" style={{ color: statusColor }}>
                {statusLabel}
              </Text>
            </View>
            <Text className="text-[13px] font-bold text-indigo">
              {formatPaise(request.pricing.totalPaise)}
            </Text>
          </View>
        </View>

        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
        >
          <AppIcon name="chevron-right" size={20} color={Palette.indiaGreen} />
        </View>
      </View>
    </Pressable>
  );
}
