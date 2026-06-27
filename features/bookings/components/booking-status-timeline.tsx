import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { AssignedExpertChip } from '@/features/bookings/components/assigned-expert-display';
import {
  getAssignedExpertName,
  getBookingTimelineEntries,
  isExpertAssignmentStatus,
} from '@/features/bookings/utils/booking-progress';
import {
  formatBookingDate,
  getBookingStatusColor,
  getBookingStatusIcon,
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
  const assignedExpertName = getAssignedExpertName(booking);
  const firstExpertEntryIndex = entries.findIndex((item) =>
    isExpertAssignmentStatus(item.status as Booking['bookingStatus']),
  );

  return (
    <View>
      {entries.map((entry, index) => {
        const isLatest = index === entries.length - 1;
        const statusKey = entry.status as Booking['bookingStatus'];
        const note = translateBookingTimelineNote(t, entry.note);
        const statusColor = getBookingStatusColor(statusKey);
        const statusIcon = getBookingStatusIcon(statusKey);
        const showExpertChip =
          Boolean(booking.expertId) &&
          isExpertAssignmentStatus(statusKey) &&
          index === firstExpertEntryIndex;

        return (
          <View key={`${entry.status}-${entry.at}-${index}`} className="flex-row gap-3">
            <View className="items-center pt-1">
              <View
                className="h-9 w-9 items-center justify-center rounded-full border-2"
                style={{
                  borderColor: isLatest ? statusColor : '#E2E8F0',
                  backgroundColor: isLatest ? `${statusColor}14` : '#F8FAFC',
                }}
              >
                <AppIcon
                  name={statusIcon}
                  size={16}
                  color={isLatest ? statusColor : '#94A3B8'}
                />
              </View>
              {index < entries.length - 1 ? (
                <View
                  className="mt-1 w-0.5 flex-1 rounded-full"
                  style={{ backgroundColor: isLatest ? `${statusColor}30` : '#E2E8F0', minHeight: 24 }}
                />
              ) : null}
            </View>

            <View
              className={`mb-3 min-w-0 flex-1 rounded-2xl border p-3.5 ${
                isLatest ? 'border-india-green/25 bg-india-green/4' : 'border-border bg-surface'
              }`}
            >
              <View className="flex-row items-start justify-between gap-2">
                <View className="min-w-0 flex-1">
                  <Text
                    className="text-[15px] font-bold leading-5"
                    style={{ color: isLatest ? Palette.indiaGreen : Palette.indigo }}
                  >
                    {translateBookingStatus(t, statusKey)}
                  </Text>
                  <Text className="mt-1 text-[12px] text-muted">
                    {formatBookingDate(entry.at, locale)}
                  </Text>
                </View>
                {isLatest ? (
                  <View className="rounded-full bg-india-green/10 px-2 py-0.5">
                    <Text className="text-[10px] font-bold uppercase tracking-wide text-india-green">
                      {t('bookingDetail.timelineLatest')}
                    </Text>
                  </View>
                ) : (
                  <AppIcon name="check-circle-outline" size={18} color="#CBD5E1" />
                )}
              </View>

              {note ? (
                <Text className="mt-2 text-[13px] leading-5 text-muted">{note}</Text>
              ) : null}

              {showExpertChip ? (
                <AssignedExpertChip
                  expertId={booking.expertId}
                  expertName={assignedExpertName ?? booking.expertName}
                />
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}
