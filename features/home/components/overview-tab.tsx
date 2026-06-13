import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { HomeHeroHeader } from '@/features/home/components/home-hero-header';
import { HomeServicesGrid } from '@/features/home/components/home-services-grid';
import { showComingSoonAlert } from '@/lib/coming-soon';
import { Palette } from '@/constants/theme';
import type { FarmerProfile } from '@/types/farmer';
import type { LandParcel } from '@/types/farmer';

type OverviewTabProps = {
  profile?: FarmerProfile;
  parcels: LandParcel[];
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  greeting: string;
  t: (key: string) => string;
};

export function OverviewTab({
  profile,
  parcels,
  isLoading,
  isRefreshing,
  onRefresh,
  greeting,
  t,
}: OverviewTabProps) {
  const displayName = profile?.name ?? t('home.profile.farmer');

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
            <HomeHeroHeader
              greeting={greeting}
              displayName={displayName}
              profile={profile}
              parcelCount={parcels.length}
              t={t}
            />

            <View className="mt-6 px-5">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-[18px] font-bold text-indigo">
                  {t('home.dashboard.servicesTitle')}
                </Text>
                <Pressable onPress={() => router.push('/(tabs)/explore' as Href)}>
                  <Text className="text-[14px] font-semibold text-india-green">
                    {t('home.overview.viewAll')}
                  </Text>
                </Pressable>
              </View>

              <HomeServicesGrid t={t} />
            </View>

            <View className="mt-5 px-5">
              <View
                className="flex-row items-center gap-3 rounded-2xl border border-border px-4 py-3.5"
                style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
              >
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white">
                  <Image
                    source={require('@/assets/icons/ai.png')}
                    style={{ width: 18, height: 18 }}
                    contentFit="contain"
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-[14px] font-bold text-indigo">
                    {t('home.dashboard.aiInsightTitle')}
                  </Text>
                  <Text className="mt-0.5 text-[13px] leading-5 text-muted">
                    {profile?.primaryCrop
                      ? t('home.dashboard.aiInsightCrop').replace('{{crop}}', profile.primaryCrop)
                      : t('home.dashboard.aiInsightDefault')}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.dashboard.askAi')}
        onPress={() => showComingSoonAlert(t)}
        className="absolute bottom-5 right-5 flex-row items-center gap-2 rounded-full bg-india-green px-5 py-3.5"
        style={{
          shadowColor: Palette.indiaGreen,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 8,
        }}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={20} color="#FFFFFF" />
        <Text className="text-[14px] font-bold text-white">{t('home.dashboard.askAi')}</Text>
      </Pressable>
    </View>
  );
}
