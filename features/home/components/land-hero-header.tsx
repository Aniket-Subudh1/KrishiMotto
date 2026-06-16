import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { FarmerHeaderActions } from '@/features/home/components/farmer-header-actions';
import { AppBarGradient, Palette } from '@/constants/theme';
import { resolveAppIcon, type IconName } from '@/lib/icon-names';
import type { FarmerProfile } from '@/types/farmer';
import type { LandParcel } from '@/types/farmer';

import { formatAcres } from '@/lib/format';

type LandHeroHeaderProps = {
  profile?: FarmerProfile;
  parcels: LandParcel[];
  t: (key: string) => string;
};

export function LandHeroHeader({ profile, parcels, t }: LandHeroHeaderProps) {
  const insets = useSafeAreaInsets();

  const totalAcres =
    profile?.totalAcres ?? parcels.reduce((sum, parcel) => sum + parcel.areaAcres, 0);
  const ownedCount = parcels.filter((p) => p.landType === 'OWNED').length;
  const leasedCount = parcels.filter((p) => p.landType === 'LEASED').length;

  const location =
    profile?.district && profile?.state
      ? `${profile.district}, ${profile.state}`
      : t('home.dashboard.locationFallback');

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
            <Text className="text-[22px] font-bold leading-7 text-white">
              {t('home.land.title')}
            </Text>
            <View className="mt-2 flex-row items-center gap-1.5">
              <AppIcon name="map-marker-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text className="flex-1 text-[13px] leading-5 text-white/85" numberOfLines={2}>
                {t('home.land.subtitle')}
              </Text>
            </View>
          </View>

          <FarmerHeaderActions>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('home.overview.addField')}
              onPress={() => router.push('/farmer/land-boundary' as Href)}
              className="h-11 w-11 items-center justify-center rounded-2xl bg-white"
              style={{
                shadowColor: Palette.indigo,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <AppIcon name="plus" size={22} color={Palette.indiaGreen} />
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

        <View className="flex-row items-stretch">
          <StatColumn
            icon="terrain"
            iconBg="rgba(233, 175, 67, 0.12)"
            iconColor={Palette.marigold}
            value={formatAcres(totalAcres)}
            bottom={location}
          />
          <View className="w-px bg-border" />
          <StatColumn
            icon="map-marker-radius-outline"
            iconBg="rgba(70, 150, 47, 0.1)"
            iconColor={Palette.indiaGreen}
            label={t('home.dashboard.fieldsLabel')}
            value={String(parcels.length)}
            valueColor={Palette.indiaGreen}
            bottom={t('home.land.countLabel')}
          />
          <View className="w-px bg-border" />
          <StatColumn
            icon="home-variant-outline"
            iconBg="rgba(244, 164, 96, 0.12)"
            iconColor={Palette.saffron}
            label={t('home.land.ownershipLabel')}
            value={String(ownedCount)}
            valueColor={Palette.saffron}
            bottom={
              leasedCount > 0
                ? t('home.land.leasedCountLabel').replace('{{count}}', String(leasedCount))
                : t('home.land.landOwned')
            }
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
    <View className="flex-1 self-stretch items-center px-2 py-4">
      {icon ? (
        <View
          className="mb-2 h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg ?? 'rgba(26, 54, 93, 0.06)' }}
        >
          <AppIcon name={resolveAppIcon(icon)} size={20} color={iconColor ?? Palette.indigo} />
        </View>
      ) : label ? (
        <FittedText className="w-full text-center text-[10px] font-medium leading-4 text-muted">
          {label}
        </FittedText>
      ) : null}
      <FittedText
        className="mt-0.5 w-full text-center text-[16px] font-bold leading-5"
        style={{ color: valueColor ?? Palette.indigo }}
      >
        {value}
      </FittedText>
      <FittedText className="mt-1 w-full text-center text-[11px] leading-4 text-muted">{bottom}</FittedText>
    </View>
  );
}
