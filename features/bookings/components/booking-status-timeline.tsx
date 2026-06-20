import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { getBookingTimelineEntries } from '@/features/bookings/utils/booking-progress';
import {
  formatBookingDate,
  translateBookingStatus,
  translateBookingTimelineNote,
} from '@/features/home/utils/booking-display';
import type { Booking } from '@/types/booking';

type BookingStatusTimelineProps = {
  booking: Booking;
  t: (key: string) => string;
  locale: string;
};

export function BookingStatusTimeline({ booking, t, locale }: BookingStatusTimelineProps) {
  const entries = getBookingTimelineEntries(booking);

  return (
    <View className="gap-3">
      {entries.map((entry, index) => {
        const isLatest = index === entries.length - 1;
        const statusKey = entry.status as Booking['bookingStatus'];
        const note = translateBookingTimelineNote(t, entry.note);

        return (
          <View key={`${entry.status}-${entry.at}-${index}`} className="flex-row gap-3">
            <View className="items-center">
              <View
                className={`h-3 w-3 rounded-full ${isLatest ? 'bg-india-green' : 'bg-border'}`}
              />
              {index < entries.length - 1 ? (
                <View className="mt-1 w-0.5 flex-1 bg-border" />
              ) : null}
            </View>
            <View className="min-w-0 flex-1 pb-4">
              <Text
                className={`text-[14px] font-semibold ${isLatest ? 'text-india-green' : 'text-indigo'}`}
              >
                {translateBookingStatus(t, statusKey)}
              </Text>
              <Text className="mt-0.5 text-[12px] text-muted">
                {formatBookingDate(entry.at, locale)}
              </Text>
              {note ? (
                <Text className="mt-1 text-[12px] leading-4 text-muted">{note}</Text>
              ) : null}
            </View>
            {isLatest ? (
              <AppIcon name="clock-outline" size={16} color={Palette.indiaGreen} />
            ) : (
              <AppIcon name="check-circle" size={16} color={Palette.indigo} />
            )}
          </View>
        );
      })}
    </View>
  );
}
