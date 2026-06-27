import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import {
  AssignedExpertBadge,
  AssignedExpertCompactRow,
} from '@/features/bookings/components/assigned-expert-display';
import {
  BOOKING_PROGRESS_MILESTONES,
  getBookingProgressPercent,
  getMilestoneIndex,
  hasAssignedExpert,
} from '@/features/bookings/utils/booking-progress';
import {
  getBookingStatusColor,
  getBookingStatusIcon,
  translateBookingStatus,
} from '@/features/home/utils/booking-display';
import type { Booking, BookingStatus } from '@/types/booking';

type BookingProgressDotsProps = {
  booking: Pick<
    Booking,
    'statusTimeline' | 'bookingStatus' | 'updatedAt' | 'expertId' | 'expertName'
  >;
  t: (key: string) => string;
  compact?: boolean;
};

function ProgressTrack({
  percent,
  tone,
}: {
  percent: number;
  tone: 'light' | 'onGradient';
}) {
  const onGradient = tone === 'onGradient';
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <View
      className="h-1.5 overflow-hidden rounded-full"
      style={{ backgroundColor: onGradient ? 'rgba(255,255,255,0.22)' : '#E2E8F0' }}
    >
      <View
        className="h-full rounded-full"
        style={{
          width: `${clamped}%`,
          backgroundColor: onGradient ? '#FFFFFF' : Palette.indiaGreen,
        }}
      />
    </View>
  );
}

const MILESTONE_LABEL_LINE_HEIGHT = 15;
const MILESTONE_LABEL_MIN_HEIGHT = MILESTONE_LABEL_LINE_HEIGHT * 2 + 2;

function MilestoneRow({
  currentStatus,
  t,
  tone,
}: {
  currentStatus: BookingStatus;
  t: (key: string) => string;
  tone: 'light' | 'onGradient';
}) {
  const onGradient = tone === 'onGradient';
  const currentMilestoneIndex = BOOKING_PROGRESS_MILESTONES.findIndex((milestone) =>
    milestone.statuses.includes(currentStatus),
  );
  const resolvedCurrentIndex =
    currentMilestoneIndex === -1
      ? Math.max(
          ...BOOKING_PROGRESS_MILESTONES.map((milestone) => getMilestoneIndex(milestone, currentStatus)),
        )
      : currentMilestoneIndex;

  return (
    <View className="mt-3 flex-row pb-1">
      {BOOKING_PROGRESS_MILESTONES.map((milestone, index) => {
        const isComplete = index < resolvedCurrentIndex;
        const isCurrent = index === resolvedCurrentIndex;
        const isFirst = index === 0;
        const isLast = index === BOOKING_PROGRESS_MILESTONES.length - 1;
        const label = t(`bookingDetail.progressMilestones.${milestone.key}`);

        return (
          <View key={milestone.key} className="min-w-0 flex-1 items-center overflow-visible">
            <View className="w-full flex-row items-center">
              <View
                className="h-0.5 flex-1 rounded-full"
                style={{
                  backgroundColor: isFirst
                    ? 'transparent'
                    : onGradient
                      ? index <= resolvedCurrentIndex
                        ? 'rgba(255,255,255,0.9)'
                        : 'rgba(255,255,255,0.25)'
                      : index <= resolvedCurrentIndex
                        ? Palette.indiaGreen
                        : '#E2E8F0',
                }}
              />
              <View
                className="h-6 w-6 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor: onGradient
                    ? isComplete || isCurrent
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.18)'
                    : isComplete || isCurrent
                      ? Palette.indiaGreen
                      : '#E2E8F0',
                }}
              >
                {isComplete ? (
                  <AppIcon
                    name="check"
                    size={12}
                    color={onGradient ? Palette.indiaGreen : '#FFFFFF'}
                  />
                ) : (
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: onGradient
                        ? isCurrent
                          ? Palette.indiaGreen
                          : 'rgba(255,255,255,0.55)'
                        : isCurrent
                          ? '#FFFFFF'
                          : '#94A3B8',
                    }}
                  />
                )}
              </View>
              <View
                className="h-0.5 flex-1 rounded-full"
                style={{
                  backgroundColor: isLast
                    ? 'transparent'
                    : onGradient
                      ? index < resolvedCurrentIndex
                        ? 'rgba(255,255,255,0.9)'
                        : 'rgba(255,255,255,0.25)'
                      : index < resolvedCurrentIndex
                        ? Palette.indiaGreen
                        : '#E2E8F0',
                }}
              />
            </View>
            <View
              className="mt-1.5 w-full items-center justify-start px-0.5"
              style={{ minHeight: MILESTONE_LABEL_MIN_HEIGHT }}
            >
              <Text
                numberOfLines={2}
                className="w-full text-center text-[10px] font-semibold"
                style={{
                  lineHeight: MILESTONE_LABEL_LINE_HEIGHT,
                  color: onGradient
                    ? isCurrent
                      ? '#FFFFFF'
                      : 'rgba(255,255,255,0.65)'
                    : isCurrent
                      ? Palette.indiaGreen
                      : '#94A3B8',
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

export function BookingProgressDots({ booking, t, compact = false }: BookingProgressDotsProps) {
  const currentStatus = booking.bookingStatus as BookingStatus;
  const cancelled = currentStatus === 'CANCELLED';
  const tone = compact ? 'light' : 'onGradient';
  const statusColor = getBookingStatusColor(currentStatus);
  const statusIcon = getBookingStatusIcon(currentStatus);
  const statusLabel = translateBookingStatus(t, currentStatus);
  const progressPercent = getBookingProgressPercent(currentStatus);
  const showExpert = hasAssignedExpert(booking);

  if (cancelled) {
    return (
      <View
        className={`flex-row items-center gap-2 rounded-xl px-3 py-2.5 ${
          compact ? 'border border-red-100 bg-red-50' : 'bg-white/12'
        }`}
      >
        <AppIcon name="close-circle-outline" size={18} color={compact ? '#EF4444' : '#FFFFFF'} />
        <Text
          className="text-[13px] font-semibold"
          style={{ color: compact ? '#EF4444' : '#FFFFFF' }}
        >
          {t('enums.bookingStatuses.cancelled')}
        </Text>
      </View>
    );
  }

  if (compact) {
    return (
      <View>
        <View className="mb-2 flex-row items-center justify-between gap-2">
          <View className="min-w-0 flex-1 flex-row items-center gap-1.5">
            <AppIcon name={statusIcon} size={14} color={statusColor} />
            <Text
              className="flex-1 text-[12px] font-semibold leading-4"
              style={{ color: statusColor }}
              numberOfLines={1}
            >
              {statusLabel}
            </Text>
          </View>
          <Text className="text-[11px] font-medium text-muted">
            {t('bookingDetail.progressPercent').replace('{{percent}}', String(progressPercent))}
          </Text>
        </View>
        <ProgressTrack percent={progressPercent} tone={tone} />
        {showExpert ? (
          <AssignedExpertCompactRow
            expertId={booking.expertId}
            expertName={booking.expertName}
            t={t}
            tone={tone}
          />
        ) : null}
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-start gap-3">
        <View
          className="h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}
        >
          <AppIcon name={statusIcon} size={22} color="#FFFFFF" />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-white/70">
            {t('bookingDetail.currentStep')}
          </Text>
          <Text className="mt-0.5 text-[18px] font-bold leading-6 text-white">{statusLabel}</Text>
        </View>
        <View className="rounded-full bg-white/15 px-2.5 py-1">
          <Text className="text-[11px] font-bold text-white">
            {t('bookingDetail.progressPercent').replace('{{percent}}', String(progressPercent))}
          </Text>
        </View>
      </View>

      <View className="mt-4">
        <ProgressTrack percent={progressPercent} tone={tone} />
      </View>

      <MilestoneRow currentStatus={currentStatus} t={t} tone={tone} />

      {showExpert ? (
        <AssignedExpertBadge
          expertId={booking.expertId}
          expertName={booking.expertName}
          t={t}
          tone={tone}
        />
      ) : null}
    </View>
  );
}
