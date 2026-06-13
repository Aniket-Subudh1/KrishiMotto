import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { AppBarGradient, Palette } from '@/constants/theme';
import type { FarmerProfile } from '@/types/farmer';

import { formatAcres } from '@/lib/format';

type HomeHeroHeaderProps = {
  greeting: string;
  displayName: string;
  profile?: FarmerProfile;
  parcelCount: number;
  t: (key: string) => string;
};

export function HomeHeroHeader({
  greeting,
  displayName,
  profile,
  parcelCount,
  t,
}: HomeHeroHeaderProps) {
  const insets = useSafeAreaInsets();

  const location =
    profile?.district && profile?.state
      ? `${profile.district}, ${profile.state}`
      : t('home.dashboard.locationFallback');

  const farmMeta = [
    profile?.district ?? t('home.dashboard.locationFallback'),
    profile?.totalAcres != null ? formatAcres(profile.totalAcres) : null,
    profile?.currentSeason ?? null,
  ]
    .filter(Boolean)
    .join(' · ');

  const totalAcres =
    profile?.totalAcres != null ? formatAcres(profile.totalAcres) : '—';

  return (
    <View>
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 64,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-[22px] font-bold leading-7 text-white">
              {greeting}, {displayName.split(' ')[0]}
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-white/85" numberOfLines={2}>
              {farmMeta}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.dashboard.notifications')}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: Palette.indigo,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Ionicons name="notifications-outline" size={20} color={Palette.indigo} />
            <View className="absolute right-2.5 top-2 h-2 w-2 rounded-full bg-red-500" />
          </Pressable>
        </View>
      </LinearGradient>

      <View
        className="mx-5 overflow-hidden rounded-2xl border border-border bg-white"
        style={{
          marginTop: -48,
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <View className="flex-row">
          <HeroStatColumn
            icon="sunny-outline"
            iconColor={Palette.marigold}
            value={totalAcres}
            bottom={location}
          />
          <View className="w-px bg-border" />
          <HeroStatColumn
            label={t('home.dashboard.fieldsLabel')}
            value={String(parcelCount)}
            valueColor={Palette.indiaGreen}
            bottom={t('home.dashboard.fieldsMapped')}
          />
          <View className="w-px bg-border" />
          <HeroStatColumn
            label={t('home.dashboard.advisoryLabel')}
            value={profile?.primaryCrop ?? t('home.dashboard.setupFarm')}
            valueColor={Palette.saffron}
            bottom={profile?.currentSeason ?? t('home.dashboard.advisoryHint')}
          />
        </View>
      </View>
    </View>
  );
}

function HeroStatColumn({
  icon,
  iconColor,
  label,
  value,
  valueColor,
  bottom,
}: {
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  label?: string;
  value: string;
  valueColor?: string;
  bottom: string;
}) {
  return (
    <View className="flex-1 items-center px-2 py-4">
      {icon ? (
        <Ionicons name={icon} size={22} color={iconColor} />
      ) : label ? (
        <Text className="text-[10px] font-medium text-muted" numberOfLines={1}>
          {label}
        </Text>
      ) : null}
      <Text
        className="mt-1.5 text-center text-[17px] font-bold leading-5"
        style={{ color: valueColor ?? Palette.indigo }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text className="mt-1 text-center text-[11px] text-muted" numberOfLines={2}>
        {bottom}
      </Text>
    </View>
  );
}
