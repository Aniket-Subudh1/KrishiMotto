import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { DateField } from '@/features/crop-calendar/components/date-field';
import { parseLocalIsoDate } from '@/lib/date';
import { Palette } from '@/constants/theme';

type DateRangeFieldsProps = {
  startLabel: string;
  endLabel: string;
  startDate: string;
  endDate: string;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  startError?: string;
  endError?: string;
  durationLabel?: string;
};

function daysBetween(start: string, end: string): number {
  const ms = parseLocalIsoDate(end).getTime() - parseLocalIsoDate(start).getTime();
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function DateRangeFields({
  startLabel,
  endLabel,
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  startError,
  endError,
  durationLabel,
}: DateRangeFieldsProps) {
  const days = startDate && endDate ? daysBetween(startDate, endDate) : 0;
  const hasDuration = days > 0 && !startError && !endError;

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <DateField
            label={startLabel}
            value={startDate}
            onChange={onStartChange}
            error={startError}
          />
        </View>
        <View className="flex-1">
          <DateField
            label={endLabel}
            value={endDate}
            onChange={onEndChange}
            minimumDate={startDate ? parseLocalIsoDate(startDate) : undefined}
            error={endError}
          />
        </View>
      </View>

      {hasDuration && durationLabel ? (
        <View className="flex-row items-center gap-2 rounded-xl bg-india-green/5 px-3 py-2.5">
          <AppIcon name="clock-outline" size={16} color={Palette.indiaGreen} />
          <Text className="text-[13px] font-medium text-indigo">
            {durationLabel.replace('{{days}}', String(days))}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
