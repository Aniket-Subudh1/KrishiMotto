import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { HomeHeroHeader } from '@/features/home/components/home-hero-header';
import { HomeServicesGrid } from '@/features/home/components/home-services-grid';
import { RequestedServicesSection } from '@/features/home/components/requested-services-section';
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
  locale: string;
  t: (key: string) => string;
};

function SectionHeader({
  title,
  actionLabel,
  onAction,
  icon,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  icon: AppIconName;
}) {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
        <View
          className="h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
        >
          <AppIcon name={icon} size={18} color={Palette.indiaGreen} />
        </View>
        <Text className="text-[18px] font-bold text-indigo">{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
        >
          <Text className="text-[13px] font-semibold text-india-green">{actionLabel}</Text>
          <AppIcon name="arrow-right" size={14} color={Palette.indiaGreen} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function OverviewTab({
  profile,
  parcels,
  isLoading,
  isRefreshing,
  onRefresh,
  greeting,
  locale,
  t,
}: OverviewTabProps) {
  const displayName = profile?.name ?? t('home.profile.farmer');

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
            <HomeHeroHeader
              greeting={greeting}
              displayName={displayName}
              profile={profile}
              parcelCount={parcels.length}
              t={t}
            />

            <View className="mt-7 px-5">
              <SectionHeader
                icon="view-grid-outline"
                title={t('home.dashboard.servicesTitle')}
                actionLabel={t('home.overview.viewAll')}
                onAction={() => router.push('/(tabs)/explore' as Href)}
              />
              <HomeServicesGrid t={t} />
            </View>

            <RequestedServicesSection t={t} locale={locale} />

            <View className="mt-6 px-5">
              <LinearGradient
                colors={['rgba(70, 150, 47, 0.12)', 'rgba(26, 54, 93, 0.06)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 1 }}
              >
                <View
                  className="flex-row items-center gap-3.5 rounded-[19px] bg-white px-4 py-4"
                  style={{
                    shadowColor: Palette.indigo,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <LinearGradient
                    colors={[Palette.indiaGreen, Palette.indigo]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AppIcon name="lightbulb-on-outline" size={22} color="#FFFFFF" />
                  </LinearGradient>
                  <View className="min-w-0 flex-1">
                    <Text className="text-[14px] font-bold text-indigo">
                      {t('home.dashboard.aiInsightTitle')}
                    </Text>
                    <Text className="mt-1 text-[13px] leading-5 text-muted">
                      {profile?.primaryCrop
                        ? t('home.dashboard.aiInsightCrop').replace('{{crop}}', profile.primaryCrop)
                        : t('home.dashboard.aiInsightDefault')}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </>
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('home.dashboard.askAi')}
        onPress={() => router.push('/krishiai')}
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
          <AppIcon name="robot-happy-outline" size={18} color="#FFFFFF" />
        </View>
        <Text className="text-[14px] font-bold text-white">{t('home.dashboard.askAi')}</Text>
      </Pressable>
    </View>
  );
}
