import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateCropType } from '@/lib/booking-i18n';
import { Palette } from '@/constants/theme';
import { CROP_TYPES, type CropType } from '@/types/booking';

const CROP_TYPE_ICONS: Record<CropType, keyof typeof Ionicons.glyphMap> = {
  Cereal: 'nutrition-outline',
  Vegetable: 'leaf-outline',
  Fruit: 'rose-outline',
  Pulses: 'ellipse-outline',
  Oilseeds: 'water-outline',
};

type CropTypeChipsProps = {
  label: string;
  value: CropType;
  onChange: (value: CropType) => void;
  error?: string;
};

export function CropTypeChips({ label, value, onChange, error }: CropTypeChipsProps) {
  const { t } = useAppLocale();

  return (
    <View className="gap-2.5">
      <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>

      <View className="flex-row flex-wrap gap-2">
        {CROP_TYPES.map((type) => {
          const selected = type === value;
          return (
            <Pressable
              key={type}
              onPress={() => onChange(type)}
              className={`flex-row items-center gap-2 rounded-full border px-3.5 py-2.5 ${
                selected
                  ? 'border-india-green bg-india-green/10'
                  : 'border-border bg-white'
              }`}
            >
              <Ionicons
                name={CROP_TYPE_ICONS[type]}
                size={15}
                color={selected ? Palette.indiaGreen : Palette.indigo}
              />
              <Text
                className={`text-[13px] font-semibold ${selected ? 'text-india-green' : 'text-indigo'}`}
              >
                {translateCropType(t, type)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View className="flex-row items-center gap-1.5 px-1">
          <Ionicons name="alert-circle" size={13} color="#EF4444" />
          <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
