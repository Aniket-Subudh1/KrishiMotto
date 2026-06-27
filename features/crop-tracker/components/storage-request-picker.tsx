import { ScrollView, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateCropType, translateStorageStatus } from '@/lib/booking-i18n';
import type { CropType } from '@/types/booking';
import type { StorageRequest } from '@/types/storage';

type StorageRequestPickerProps = {
  label: string;
  requests: StorageRequest[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function StorageRequestPicker({
  label,
  requests,
  selectedId,
  onSelect,
}: StorageRequestPickerProps) {
  const { t, locale } = useAppLocale();

  if (requests.length <= 1) {
    return null;
  }

  return (
    <View className="gap-2.5">
      <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">{label}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-3 pr-1"
      >
        {requests.map((request) => {
          const selected = request.id === selectedId;
          const quantity = request.quantityKg.toLocaleString(locale === 'en' ? 'en-IN' : locale);

          return (
            <Pressable
              key={request.id}
              onPress={() => onSelect(request.id)}
              className={`w-[200px] overflow-hidden rounded-2xl border bg-white ${
                selected ? 'border-india-green bg-surface' : 'border-border'
              }`}
            >
              <View className={`h-1 ${selected ? 'bg-india-green' : 'bg-transparent'}`} />
              <View className="gap-2 p-4">
                <View className="flex-row items-start justify-between gap-2">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(70, 150, 47, 0.12)' }}
                  >
                    <AppIcon name="sprout-outline" size={18} color={Palette.indiaGreen} />
                  </View>
                  {selected ? (
                    <View className="h-5 w-5 items-center justify-center rounded-full bg-india-green">
                      <AppIcon name="check" size={12} color="#FFFFFF" />
                    </View>
                  ) : null}
                </View>
                <Text className="text-[15px] font-bold text-indigo" numberOfLines={1}>
                  {translateCropType(t, request.cropType as CropType)}
                </Text>
                <Text className="text-[12px] text-muted" numberOfLines={1}>
                  {t('cropTracker.quantityKg', { quantity })}
                </Text>
                <Text className="text-[11px] font-medium text-india-green" numberOfLines={1}>
                  {translateStorageStatus(t, request.status)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
