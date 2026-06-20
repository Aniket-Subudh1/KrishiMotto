import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { AppBarGradient, Palette } from '@/constants/theme';
import { FarmerHeaderActions } from '@/features/home/components/farmer-header-actions';
import {
  formatExpertServiceDistricts,
  getExpertProfilePhotoUrl,
  translateExpertKycStatus,
} from '@/lib/expert-profile-display';
import type { ExpertProfile } from '@/types/expert';

type ExpertProfileHeroHeaderProps = {
  profile?: ExpertProfile;
  displayName: string;
  phoneNumber?: string;
  photoUrl?: string;
  onEditPress: () => void;
  onPhotoPress: () => void;
  isPhotoUploading?: boolean;
  t: (key: string) => string;
};

export function ExpertProfileHeroHeader({
  profile,
  displayName,
  phoneNumber,
  photoUrl,
  onEditPress,
  onPhotoPress,
  isPhotoUploading = false,
  t,
}: ExpertProfileHeroHeaderProps) {
  const insets = useSafeAreaInsets();
  const resolvedPhotoUrl = photoUrl ?? getExpertProfilePhotoUrl(profile);
  const districts = profile ? formatExpertServiceDistricts(profile) : '';
  const pincodes = profile?.servicePincodes?.join(', ') ?? '';
  const serviceArea =
    [districts, pincodes ? `${t('expertDashboard.profile.pincodesShort')}: ${pincodes}` : '']
      .filter(Boolean)
      .join(' · ') || t('expertDashboard.hero.serviceAreasFallback');

  const years =
    profile?.yearsExperience != null ? String(profile.yearsExperience) : t('home.profile.notSet');
  const specialisation = profile?.specialisation ?? t('home.profile.notSet');
  const kycLabel = profile
    ? translateExpertKycStatus(t, profile.kycStatus)
    : t('home.profile.notSet');

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
              {t('expertDashboard.profile.subtitle')}
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
              {resolvedPhotoUrl ? (
                <Image
                  source={{ uri: resolvedPhotoUrl }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              ) : (
                <AppIcon name="account-tie" size={52} color={Palette.indiaGreen} />
              )}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('expertSignUp.addPhoto')}
              accessibilityState={{ disabled: isPhotoUploading, busy: isPhotoUploading }}
              disabled={isPhotoUploading}
              onPress={onPhotoPress}
              className="absolute bottom-1 right-1 h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-india-green"
              style={{
                shadowColor: Palette.indigo,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 4,
              }}
            >
              {isPhotoUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <AppIcon name="camera-outline" size={18} color="#FFFFFF" />
              )}
            </Pressable>
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
              {serviceArea}
            </FittedText>
          </View>
          {profile?.verifiedBadge ? (
            <View className="mt-3 flex-row items-center gap-1.5 rounded-full bg-india-green/10 px-3 py-1">
              <AppIcon name="check-decagram" size={14} color={Palette.indiaGreen} />
              <Text className="text-[12px] font-semibold text-india-green">
                {t('expertDashboard.hero.verified')}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="flex-row items-stretch border-t border-border">
          <StatColumn
            icon="calendar-clock"
            iconBg="rgba(233, 175, 67, 0.12)"
            iconColor={Palette.marigold}
            value={years}
            bottom={t('expertSignUp.yearsExperienceLabel')}
          />
          <View className="w-px bg-border" />
          <StatColumn
            icon="school-outline"
            iconBg="rgba(70, 150, 47, 0.1)"
            iconColor={Palette.indiaGreen}
            value={specialisation}
            valueColor={Palette.indiaGreen}
            bottom={t('expertSignUp.specialisationLabel')}
          />
          <View className="w-px bg-border" />
          <StatColumn
            icon="shield-check-outline"
            iconBg="rgba(244, 164, 96, 0.12)"
            iconColor={Palette.saffron}
            value={kycLabel}
            valueColor={profile?.kycStatus === 'VERIFIED' ? Palette.indiaGreen : Palette.saffron}
            bottom={t('expertDashboard.profile.kycStatusLabel')}
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
  value,
  valueColor,
  bottom,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string;
  valueColor?: string;
  bottom: string;
}) {
  return (
    <View className="flex-1 self-stretch items-center px-2 py-3.5">
      <View
        className="mb-1.5 h-8 w-8 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        <AppIcon name={icon as 'calendar-clock'} size={18} color={iconColor} />
      </View>
      <FittedText
        maxLines={2}
        className="mt-0.5 w-full text-center text-[13px] font-bold leading-4"
        style={{ color: valueColor ?? Palette.indigo }}
      >
        {value}
      </FittedText>
      <FittedText className="mt-0.5 w-full text-center text-[10px] leading-4 text-muted">
        {bottom}
      </FittedText>
    </View>
  );
}
