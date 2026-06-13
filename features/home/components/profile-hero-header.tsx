import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { AppBarGradient, Palette } from '@/constants/theme';
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

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.profile.edit')}
            onPress={onEditPress}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: Palette.indigo,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Ionicons name="create-outline" size={20} color={Palette.indiaGreen} />
          </Pressable>
        </View>
      </LinearGradient>

      <View
        className="mx-5 overflow-hidden rounded-2xl bg-white"
        style={{
          marginTop: -72,
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
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
                <Ionicons name="person" size={48} color={Palette.indiaGreen} />
              )}
            </View>
          </View>
          <Text className="mt-4 text-[20px] font-bold text-indigo" numberOfLines={1}>
            {displayName}
          </Text>
          {phoneNumber ? (
            <Text className="mt-1 text-[14px] text-muted">+91 {phoneNumber}</Text>
          ) : null}
          <Text className="mt-0.5 text-[13px] text-muted" numberOfLines={1}>
            {location}
          </Text>
        </View>

        <View className="flex-row border-t border-border">
          <StatColumn
            icon="resize-outline"
            iconColor={Palette.marigold}
            value={totalAcres}
            bottom={t('home.profile.totalAcres')}
          />
          <View className="w-px bg-border" />
          <StatColumn
            label={t('home.profile.cropLabel')}
            value={crop}
            valueColor={Palette.indiaGreen}
            bottom={t('home.profile.statsCropHint')}
          />
          <View className="w-px bg-border" />
          <StatColumn
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
    <View className="flex-1 items-center px-2 py-3.5">
      {icon ? (
        <Ionicons name={icon} size={20} color={iconColor} />
      ) : label ? (
        <Text className="text-[10px] font-medium text-muted" numberOfLines={1}>
          {label}
        </Text>
      ) : null}
      <Text
        className="mt-1 text-center text-[15px] font-bold leading-5"
        style={{ color: valueColor ?? Palette.indigo }}
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text className="mt-0.5 text-center text-[10px] text-muted" numberOfLines={1}>
        {bottom}
      </Text>
    </View>
  );
}
