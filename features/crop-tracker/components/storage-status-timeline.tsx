import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { translateStorageStatus } from '@/lib/booking-i18n';
import { formatDate } from '@/lib/format';
import { useAppLocale } from '@/hooks/use-app-locale';
import type { StorageRequest } from '@/types/storage';

type StorageStatusTimelineProps = {
  request: StorageRequest;
};

export function StorageStatusTimeline({ request }: StorageStatusTimelineProps) {
  const { t } = useAppLocale();
  const entries = request.statusTimeline.length
    ? request.statusTimeline
    : [{ status: request.status, at: request.updatedAt }];

  return (
    <View className="gap-3">
      {entries.map((entry, index) => {
        const isLatest = index === entries.length - 1;
        return (
          <View key={`${entry.status}-${entry.at}`} className="flex-row gap-3">
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
                {translateStorageStatus(t, entry.status as StorageRequest['status'])}
              </Text>
              <Text className="mt-0.5 text-[12px] text-muted">{formatDate(entry.at)}</Text>
              {entry.note ? (
                <Text className="mt-1 text-[12px] leading-4 text-muted">{entry.note}</Text>
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
