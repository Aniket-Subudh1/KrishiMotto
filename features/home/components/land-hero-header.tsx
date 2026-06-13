import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { AppBarGradient, Palette } from '@/constants/theme';
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
          paddingBottom: 64,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="min-w-0 flex-1 pr-3">
            <Text className="text-[22px] font-bold leading-7 text-white">
              {t('home.land.title')}
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-white/85" numberOfLines={2}>
              {t('home.land.subtitle')}
            </Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('home.overview.addField')}
            onPress={() => router.push('/farmer/land-boundary' as Href)}
            className="h-10 w-10 items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: Palette.indigo,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <Ionicons name="add" size={22} color={Palette.indiaGreen} />
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
          <StatColumn
            icon="resize-outline"
            iconColor={Palette.marigold}
            value={formatAcres(totalAcres)}
            bottom={location}
          />
          <View className="w-px bg-border" />
          <StatColumn
            label={t('home.dashboard.fieldsLabel')}
            value={String(parcels.length)}
            valueColor={Palette.indiaGreen}
            bottom={t('home.land.countLabel')}
          />
          <View className="w-px bg-border" />
          <StatColumn
            label={t('home.land.ownershipLabel')}
            value={String(ownedCount)}
            valueColor={Palette.saffron}
            bottom={
              leasedCount > 0
                ? `${leasedCount} ${t('home.land.landLeased').toLowerCase()}`
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
