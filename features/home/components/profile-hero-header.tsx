import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { FarmerHeaderActions } from '@/features/home/components/farmer-header-actions';
import { AppBarGradient, Palette } from '@/constants/theme';
import { resolveAppIcon, type IconName } from '@/lib/icon-names';
import type { FarmerProfile } from '@/types/farmer';

import { formatAcres } from '@/lib/format';

type ProfileHeroHeaderProps = {
  profile?: FarmerProfile;
  displayName: string;
  phoneNumber?: string;
  onEditPress: () => void;
  t: (key: string) => string;
};

export function ProfileHeroHeader({
  profile,
  displayName,
  phoneNumber,
  onEditPress,
  t,
}: ProfileHeroHeaderProps) {
  const insets = useSafeAreaInsets();

  const location =
    profile?.district && profile?.state
      ? `${profile.district}, ${profile.state}`
      : t('home.dashboard.locationFallback');

  const totalAcres =
    profile?.totalAcres != null ? formatAcres(profile.totalAcres) : '—';
  const crop = profile?.primaryCrop ?? '—';
  const season = profile?.currentSeason ?? '—';

  return (
    <View>
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 88,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-[22px] font-bold leading-7 text-white">
              {t('home.tabs.profile')}
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-white/85" numberOfLines={2}>
              {t('home.profile.subtitle')}
            </Text>
          </View>

          <FarmerHeaderActions>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.profile.edit')}
              onPress={onEditPress}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
              style={{
                shadowColor: Palette.indigo,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <AppIcon name="pencil-outline" size={20} color={Palette.indiaGreen} />
            </Pressable>
          </FarmerHeaderActions>
        </View>
      </LinearGradient>

      <View
        className="mx-5 overflow-hidden rounded-3xl bg-white"
        style={{
          marginTop: -72,
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

        <View className="items-center px-5 pb-5 pt-5">
          <View className="h-[128px] w-[128px] items-center justify-center">
            <View className="absolute h-[128px] w-[128px] rounded-full bg-splash-glow" />
            <View className="absolute h-[112px] w-[112px] rounded-full bg-splash-glow opacity-70" />
            <View
              className="h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-full bg-white"
              style={{
                shadowColor: Palette.indiaGreen,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              {profile?.profilePicUrl ? (
                <Image
                  source={{ uri: profile.profilePicUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <AppIcon name="account-circle" size={52} color={Palette.indiaGreen} />
              )}
            </View>
          </View>
          <FittedText className="mt-4 w-full text-center text-[20px] font-bold leading-6 text-indigo">
            {displayName}
          </FittedText>
          {phoneNumber ? (
            <View className="mt-1 flex-row items-center gap-1.5">
              <AppIcon name="phone-outline" size={14} color="#94A3B8" />
              <Text className="text-[14px] text-muted">+91 {phoneNumber}</Text>
            </View>
          ) : null}
          <View className="mt-1 w-full flex-row items-start gap-1.5 px-4">
            <AppIcon name="map-marker-outline" size={14} color="#94A3B8" style={{ marginTop: 2 }} />
            <FittedText shrink className="flex-1 text-[13px] leading-5 text-muted">
              {location}
            </FittedText>
          </View>
        </View>

        <View className="flex-row items-stretch border-t border-border">
          <StatColumn
            icon="terrain"
            iconBg="rgba(233, 175, 67, 0.12)"
            iconColor={Palette.marigold}
            value={totalAcres}
            bottom={t('home.profile.totalAcres')}
          />
          <View className="w-px bg-border" />
          <StatColumn
            icon="sprout-outline"
            iconBg="rgba(70, 150, 47, 0.1)"
            iconColor={Palette.indiaGreen}
            label={t('home.profile.cropLabel')}
            value={crop}
            valueColor={Palette.indiaGreen}
            bottom={t('home.profile.statsCropHint')}
          />
          <View className="w-px bg-border" />
          <StatColumn
            icon="weather-sunny"
            iconBg="rgba(244, 164, 96, 0.12)"
            iconColor={Palette.saffron}
            label={t('home.profile.seasonLabel')}
            value={season}
            valueColor={Palette.saffron}
            bottom={t('home.profile.statsSeasonHint')}
          />
        </View>
      </View>
    </View>
  );
}

function StatColumn({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  bottom,
}: {
  icon?: IconName;
  iconBg?: string;
  iconColor?: string;
  label?: string;
  value: string;
  valueColor?: string;
  bottom: string;
}) {
  return (
    <View className="flex-1 self-stretch items-center px-2 py-3.5">
      {icon ? (
        <View
          className="mb-1.5 h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg ?? 'rgba(26, 54, 93, 0.06)' }}
        >
          <AppIcon name={resolveAppIcon(icon)} size={18} color={iconColor ?? Palette.indigo} />
        </View>
      ) : label ? (
        <FittedText className="w-full text-center text-[10px] font-medium leading-4 text-muted">
          {label}
        </FittedText>
      ) : null}
      <FittedText
        className="mt-0.5 w-full text-center text-[15px] font-bold leading-5"
        style={{ color: valueColor ?? Palette.indigo }}
      >
        {value}
      </FittedText>
      <FittedText className="mt-0.5 w-full text-center text-[10px] leading-4 text-muted">{bottom}</FittedText>
    </View>
  );
}
