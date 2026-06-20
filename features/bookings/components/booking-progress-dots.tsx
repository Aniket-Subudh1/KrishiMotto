import { Platform, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import {
  getBookingTimelineEntries,
  showPendingProgressDot,
} from '@/features/bookings/utils/booking-progress';
import { translateBookingStatus } from '@/features/home/utils/booking-display';
import type { Booking, BookingStatus } from '@/types/booking';

type BookingProgressDotsProps = {
  booking: Pick<Booking, 'statusTimeline' | 'bookingStatus' | 'updatedAt'>;
  t: (key: string) => string;
  compact?: boolean;
};

type StepKind = 'filled' | 'pending';

type ProgressStep = {
  key: string;
  status: BookingStatus;
  kind: StepKind;
};

function buildProgressSteps(
  entries: ReturnType<typeof getBookingTimelineEntries>,
  showPending: boolean,
): ProgressStep[] {
  const steps: ProgressStep[] = entries.map((entry, index) => ({
    key: `${entry.status}-${entry.at}-${index}`,
    status: entry.status as BookingStatus,
    kind: 'filled',
  }));

  if (showPending) {
    steps.push({
      key: 'pending-completed',
      status: 'COMPLETED',
      kind: 'pending',
    });
  }

  return steps;
}

export function BookingProgressDots({ booking, t, compact = false }: BookingProgressDotsProps) {
  const entries = getBookingTimelineEntries(booking);
  const currentStatus = booking.bookingStatus as BookingStatus;
  const cancelled = currentStatus === 'CANCELLED';
  const showPending = showPendingProgressDot(currentStatus);
  const steps = buildProgressSteps(entries, showPending);
  const filledCount = entries.length;
  const currentFilledIndex = filledCount - 1;
  const tone = compact ? 'light' : 'onGradient';
  const dotSize = compact ? 'h-2.5 w-2.5' : 'h-3 w-3';
  const labelFontSize = compact ? 10 : 11;
  const labelLineHeight = compact ? 16 : 18;
  const labelMinHeight = compact ? 36 : 40;

  if (cancelled && entries.length === 0) {
    return (
      <Text className="text-[12px] font-medium text-red-500">
        {t('enums.bookingStatuses.cancelled')}
      </Text>
    );
  }

  return (
    <View className="flex-row">
      {steps.map((step, index) => {
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;
        const isPending = step.kind === 'pending';
        const filledIndex = isPending ? -1 : index;
        const isComplete = !isPending && filledIndex < currentFilledIndex;
        const isCurrent =
          !isPending && filledIndex === currentFilledIndex && !cancelled;
        const isCancelledCurrent =
          !isPending && filledIndex === currentFilledIndex && cancelled;

        const leftLineActive = index > 0 && index <= currentFilledIndex;
        const rightLineActive = !isPending && index < currentFilledIndex;

        const dotColor = isCancelledCurrent
          ? '#EF4444'
          : isComplete || isCurrent
            ? Palette.indiaGreen
            : isPending
              ? 'transparent'
              : '#CBD5E1';

        const label = translateBookingStatus(t, step.status);
        const labelColor =
          tone === 'onGradient'
            ? isCurrent
              ? '#FFFFFF'
              : isPending
                ? 'rgba(255,255,255,0.55)'
                : 'rgba(255,255,255,0.75)'
            : isCurrent
              ? Palette.indiaGreen
              : '#94A3B8';

        return (
          <View key={step.key} className="min-w-0 flex-1">
            <View className="flex-row items-center">
              <View
                className="h-0.5 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    tone === 'onGradient'
                      ? isFirst
                        ? 'transparent'
                        : leftLineActive
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(255,255,255,0.3)'
                      : isFirst
                        ? 'transparent'
                        : leftLineActive
                          ? Palette.indiaGreen
                          : '#E2E8F0',
                }}
              />
              {isPending ? (
                <View
                  className={`shrink-0 rounded-full border-2 bg-white ${dotSize}`}
                  style={{ borderColor: tone === 'onGradient' ? 'rgba(255,255,255,0.55)' : '#CBD5E1' }}
                />
              ) : (
                <View
                  className={`shrink-0 rounded-full ${dotSize}`}
                  style={{ backgroundColor: dotColor }}
                />
              )}
              <View
                className="h-0.5 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    tone === 'onGradient'
                      ? isLast
                        ? 'transparent'
                        : rightLineActive
                          ? 'rgba(255,255,255,0.9)'
                          : 'rgba(255,255,255,0.3)'
                      : isLast
                        ? 'transparent'
                        : rightLineActive
                          ? Palette.indiaGreen
                          : '#E2E8F0',
                }}
              />
            </View>
            <View className="mt-1.5 justify-center px-0.5" style={{ minHeight: labelMinHeight }}>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                className="text-center font-semibold"
                style={{
                  color: labelColor,
                  fontSize: labelFontSize,
                  lineHeight: labelLineHeight,
                  ...(Platform.OS === 'android' ? { includeFontPadding: true } : null),
                }}
              >
                {label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
