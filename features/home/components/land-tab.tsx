import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { LandHeroHeader } from '@/features/home/components/land-hero-header';
import { LandParcelCard } from '@/features/home/components/land-parcel-card';
import { Palette } from '@/constants/theme';
import type { FarmerProfile } from '@/types/farmer';
import type { LandParcel } from '@/types/farmer';

type LandTabProps = {
  profile?: FarmerProfile;
  parcels: LandParcel[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  onParcelPress: (id: string) => void;
  t: (key: string) => string;
};

export function LandTab({
  profile,
  parcels,
  isLoading,
  isRefreshing,
  onRefresh,
  onParcelPress,
  t,
}: LandTabProps) {
  function landTypeLabel(type: LandParcel['landType']) {
    return type === 'OWNED' ? t('home.land.landOwned') : t('home.land.landLeased');
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-32"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={Palette.indiaGreen} />
          </View>
        ) : (
          <>
            <LandHeroHeader profile={profile} parcels={parcels} t={t} />

            <View className="mt-7 px-5">
              <View className="mb-4 flex-row items-center gap-2.5">
                <View
                  className="h-8 w-8 items-center justify-center rounded-xl"
                  style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
                >
                  <AppIcon name="map-marker-radius-outline" size={18} color={Palette.indiaGreen} />
                </View>
                <Text className="flex-1 text-[18px] font-bold text-indigo">
                  {t('home.land.yourFields')}
                </Text>
                {parcels.length > 0 ? (
                  <View
                    className="min-w-[26px] items-center justify-center rounded-full px-2 py-0.5"
                    style={{ backgroundColor: 'rgba(70, 150, 47, 0.12)' }}
                  >
                    <Text className="text-[12px] font-bold text-india-green">
                      {parcels.length}
                    </Text>
                  </View>
                ) : null}
              </View>

              {parcels.length > 0 ? (
                <View className="gap-3">
                  {parcels.map((parcel) => (
                    <LandParcelCard
                      key={parcel.id}
                      parcel={parcel}
                      onPress={() => onParcelPress(parcel.id)}
                      landTypeLabel={landTypeLabel}
                    />
                  ))}
                </View>
              ) : (
                <View
                  className="items-center rounded-2xl border border-dashed border-india-green/30 bg-surface px-6 py-12"
                  style={{
                    shadowColor: Palette.indigo,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <View
                    className="h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
                  >
                    <AppIcon name="earth" size={34} color={Palette.indiaGreen} />
                  </View>
                  <Text className="mt-4 text-center text-[17px] font-bold text-indigo">
                    {t('home.land.emptyTitle')}
                  </Text>
                  <Text className="mt-2 text-center text-[14px] leading-5 text-muted">
                    {t('home.land.emptyBody')}
                  </Text>
                  <Button
                    size="lg"
                    className="mt-6 w-full"
                    onPress={() => router.push('/farmer/land-boundary' as Href)}
                  >
                    {t('home.overview.addField')}
                  </Button>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {parcels.length > 0 ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('home.land.addFieldFab')}
          onPress={() => router.push('/farmer/land-boundary' as Href)}
          className="absolute bottom-6 right-5 flex-row items-center gap-2.5 rounded-full px-5 py-4"
          style={({ pressed }) => ({
            backgroundColor: Palette.indiaGreen,
            shadowColor: Palette.indiaGreen,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: pressed ? 0.25 : 0.4,
            shadowRadius: 12,
            elevation: 10,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <View className="h-7 w-7 items-center justify-center rounded-full bg-white/20">
            <AppIcon name="plus" size={18} color="#FFFFFF" />
          </View>
          <Text className="text-[14px] font-bold text-white">{t('home.land.addFieldFab')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
