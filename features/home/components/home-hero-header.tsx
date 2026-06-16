import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { FarmerHeaderActions } from '@/features/home/components/farmer-header-actions';
import { AppBarGradient, Palette } from '@/constants/theme';
import type { FarmerProfile } from '@/types/farmer';

import { showComingSoonAlert } from '@/lib/coming-soon';
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
    profile?.totalAcres != null ? formatAcres(profile.totalAcres) : t('home.profile.notSet');

  return (
    <View>
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 72,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-[13px] font-medium uppercase tracking-wider text-white/75">
              {greeting}
            </Text>
            <Text className="mt-0.5 text-[24px] font-bold leading-8 text-white">
              {displayName.split(' ')[0]}
            </Text>
            <View className="mt-2 flex-row items-center gap-1.5">
              <AppIcon name="map-marker-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text className="flex-1 text-[13px] leading-5 text-white/85" numberOfLines={2}>
                {farmMeta}
              </Text>
            </View>
          </View>

          <FarmerHeaderActions>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.dashboard.notifications')}
              onPress={() => showComingSoonAlert(t)}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
              style={{
                shadowColor: Palette.indigo,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <AppIcon name="bell-outline" size={22} color={Palette.indigo} />
              <View className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full border border-white bg-red-500" />
            </Pressable>
          </FarmerHeaderActions>
        </View>
      </LinearGradient>

      <View
        className="mx-5 overflow-hidden rounded-3xl bg-white"
        style={{
          marginTop: -52,
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        <View className="h-[3px] overflow-hidden">
          <LinearGradient
            colors={[Palette.saffron, Palette.indiaGreen]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </View>

        <View className="flex-row">
          <HeroStatColumn
            icon="terrain"
            iconBg="rgba(233, 175, 67, 0.12)"
            iconColor={Palette.marigold}
            value={totalAcres}
            bottom={location}
          />
          <View className="w-px bg-border" />
          <HeroStatColumn
            icon="map-marker-radius-outline"
            iconBg="rgba(70, 150, 47, 0.1)"
            iconColor={Palette.indiaGreen}
            label={t('home.dashboard.fieldsLabel')}
            value={String(parcelCount)}
            valueColor={Palette.indiaGreen}
            bottom={t('home.dashboard.fieldsMapped')}
          />
          <View className="w-px bg-border" />
          <HeroStatColumn
            icon="sprout-outline"
            iconBg="rgba(244, 164, 96, 0.12)"
            iconColor={Palette.saffron}
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
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  bottom,
}: {
  icon: AppIconName;
  iconBg: string;
  iconColor: string;
  label?: string;
  value: string;
  valueColor?: string;
  bottom: string;
}) {
  return (
    <View className="flex-1 items-center px-2 py-4">
      <View
        className="mb-2 h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        <AppIcon name={icon} size={20} color={iconColor} />
      </View>
      {label ? (
        <Text className="text-[10px] font-medium uppercase tracking-wide text-muted" numberOfLines={1}>
          {label}
        </Text>
      ) : null}
      <Text
        className="mt-0.5 text-center text-[16px] font-bold leading-5"
        style={{ color: valueColor ?? Palette.indigo }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text className="mt-1 text-center text-[11px] leading-4 text-muted" numberOfLines={2}>
        {bottom}
      </Text>
    </View>
  );
}
