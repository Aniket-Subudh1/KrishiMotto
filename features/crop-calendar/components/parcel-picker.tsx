import { Pressable, ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { useAppLocale } from '@/hooks/use-app-locale';
import { formatAcres } from '@/lib/format';
import { Palette } from '@/constants/theme';
import type { LandParcel } from '@/types/farmer';

type ParcelPickerProps = {
  label: string;
  parcels: LandParcel[];
  selectedId: string | null;
  onSelect: (parcelId: string) => void;
  onAddField?: () => void;
  error?: string;
  addFieldLabel: string;
  hint?: string;
};

export function ParcelPicker({
  label,
  parcels,
  selectedId,
  onSelect,
  onAddField,
  error,
  addFieldLabel,
  hint,
}: ParcelPickerProps) {
  const { t } = useAppLocale();

  return (
    <View className="gap-2.5">
      <View>
        <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>
        {hint ? <Text className="mt-0.5 text-[12px] text-muted">{hint}</Text> : null}
      </View>

      {parcels.length === 0 ? (
        <Pressable
          onPress={onAddField}
          className="flex-row items-center gap-3 rounded-2xl border border-dashed border-india-green/50 bg-surface px-4 py-5"
        >
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-india-green/10">
            <AppIcon name="plus-circle-outline" size={24} color={Palette.indiaGreen} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[15px] font-bold text-india-green">{addFieldLabel}</Text>
            <Text className="mt-0.5 text-[12px] text-muted">{t('common.parcelPicker.mapFieldFirst')}</Text>
          </View>
          <AppIcon name="chevron-right" size={20} color={Palette.indiaGreen} />
        </Pressable>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 pr-1"
        >
          {parcels.map((parcel) => {
            const selected = parcel.id === selectedId;
            return (
              <Pressable
                key={parcel.id}
                onPress={() => onSelect(parcel.id)}
                className={`w-[200px] overflow-hidden rounded-2xl border bg-white ${
                  selected ? 'border-india-green bg-surface' : 'border-border'
                }`}
              >
                <View className={`h-1 ${selected ? 'bg-india-green' : 'bg-transparent'}`} />
                <View className="gap-3 p-4">
                  <View className="flex-row items-start justify-between">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: selected
                          ? 'rgba(70, 150, 47, 0.12)'
                          : 'rgba(26, 54, 93, 0.06)',
                      }}
                    >
                      <AppIcon
                        name="map-marker-outline"
                        size={18}
                        color={selected ? Palette.indiaGreen : Palette.indigo}
                      />
                    </View>
                    {selected ? (
                      <View className="rounded-full bg-india-green px-2 py-0.5">
                        <Text className="text-[10px] font-bold text-white">
                          {t('common.parcelPicker.selected')}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <View>
                    <Text className="text-[15px] font-bold text-indigo" numberOfLines={2}>
                      {parcel.name}
                    </Text>
                    <Text className="mt-1 text-[13px] font-semibold text-india-green">
                      {formatAcres(parcel.areaAcres)}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}

          {onAddField ? (
            <Pressable
              onPress={onAddField}
              className="w-[120px] items-center justify-center rounded-2xl border border-dashed border-border bg-surface px-3 py-4"
            >
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
                <AppIcon name="plus" size={22} color={Palette.indigo} />
              </View>
              <Text className="mt-2 text-center text-[12px] font-semibold text-indigo">
                {t('common.parcelPicker.addField')}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}

      {error ? (
        <View className="flex-row items-center gap-1.5 px-1">
          <AppIcon name="alert-circle-outline" size={13} color="#EF4444" />
          <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
