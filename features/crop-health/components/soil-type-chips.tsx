import { Pressable, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateSoilType } from '@/lib/booking-i18n';
import { Palette } from '@/constants/theme';
import { SOIL_TYPES, type SoilType } from '@/types/booking';

const SOIL_TYPE_ICONS: Record<SoilType, AppIconName> = {
  Clay: 'water',
  Sandy: 'weather-sunny',
  Loamy: 'sprout-outline',
  Silty: 'layers-outline',
  Peaty: 'flask-outline',
  Chalky: 'circle-outline',
};

type SoilTypeChipsProps = {
  label: string;
  value: SoilType;
  onChange: (value: SoilType) => void;
  error?: string;
};

export function SoilTypeChips({ label, value, onChange, error }: SoilTypeChipsProps) {
  const { t } = useAppLocale();

  return (
    <View className="gap-2.5">
      <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>

      <View className="flex-row flex-wrap gap-2">
        {SOIL_TYPES.map((type) => {
          const selected = type === value;
          return (
            <Pressable
              key={type}
              onPress={() => onChange(type)}
              className={`flex-row items-center gap-2 rounded-full border px-3.5 py-2.5 ${
                selected ? 'border-india-green bg-india-green/10' : 'border-border bg-white'
              }`}
            >
              <AppIcon
                name={SOIL_TYPE_ICONS[type]}
                size={15}
                color={selected ? Palette.indiaGreen : Palette.indigo}
              />
              <Text
                className={`text-[13px] font-semibold ${selected ? 'text-india-green' : 'text-indigo'}`}
              >
                {translateSoilType(t, type)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View className="flex-row items-center gap-1.5 px-1">
          <AppIcon name="alert-circle-outline" size={13} color="#EF4444" />
          <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
