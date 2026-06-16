import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateSeason } from '@/lib/booking-i18n';
import { Palette } from '@/constants/theme';
import { SEASONS, type Season } from '@/types/booking';

type SeasonMeta = {
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  bg: string;
};

const SEASON_META: Record<Season, SeasonMeta> = {
  Kharif: { icon: 'rainy-outline', accent: Palette.indiaGreen, bg: 'rgba(70, 150, 47, 0.1)' },
  Rabi: { icon: 'snow-outline', accent: '#3B82F6', bg: 'rgba(59, 130, 246, 0.1)' },
  Zaid: { icon: 'sunny-outline', accent: Palette.saffron, bg: 'rgba(244, 164, 96, 0.15)' },
};

type SeasonChipsProps = {
  label: string;
  value: Season;
  onChange: (value: Season) => void;
  getHint: (season: Season) => string;
  error?: string;
};

export function SeasonChips({ label, value, onChange, getHint, error }: SeasonChipsProps) {
  const { t } = useAppLocale();

  return (
    <View className="gap-2.5">
      <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>

      <View className="flex-row gap-2.5">
        {SEASONS.map((season) => {
          const selected = season === value;
          const meta = SEASON_META[season];

          return (
            <Pressable
              key={season}
              onPress={() => onChange(season)}
              className={`min-h-[88px] flex-1 overflow-hidden rounded-2xl border px-2.5 py-3 ${
                selected ? 'border-india-green bg-surface' : 'border-border bg-white'
              }`}
              style={
                selected
                  ? {
                      shadowColor: Palette.indiaGreen,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.12,
                      shadowRadius: 6,
                      elevation: 2,
                    }
                  : undefined
              }
            >
              <View
                className="mb-2 h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: meta.bg }}
              >
                <Ionicons name={meta.icon} size={16} color={meta.accent} />
              </View>
              <Text
                className={`text-[13px] font-bold ${selected ? 'text-india-green' : 'text-indigo'}`}
              >
                {translateSeason(t, season)}
              </Text>
              <Text className="mt-0.5 text-[10px] leading-3 text-muted" numberOfLines={2}>
                {getHint(season)}
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
