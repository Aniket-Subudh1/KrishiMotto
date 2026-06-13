import { Ionicons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

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
        contentContainerClassName="pb-28"
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

            <View className="mt-6 px-5">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-[18px] font-bold text-indigo">
                  {t('home.land.yourFields')}
                </Text>
                {parcels.length > 0 ? (
                  <View
                    className="rounded-full px-3 py-1"
                    style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
                  >
                    <Text className="text-[12px] font-semibold text-india-green">
                      {parcels.length} {t('home.land.countLabel')}
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
                  className="items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12"
                  style={{
                    shadowColor: Palette.indigo,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.04,
                    shadowRadius: 4,
                    elevation: 1,
                  }}
                >
                  <View
                    className="h-16 w-16 items-center justify-center rounded-full"
                    style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
                  >
                    <Ionicons name="earth-outline" size={34} color={Palette.indiaGreen} />
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
          className="absolute bottom-5 right-5 flex-row items-center gap-2 rounded-full bg-india-green px-5 py-3.5"
          style={{
            shadowColor: Palette.indiaGreen,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 10,
            elevation: 8,
          }}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text className="text-[14px] font-bold text-white">{t('home.land.addFieldFab')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
