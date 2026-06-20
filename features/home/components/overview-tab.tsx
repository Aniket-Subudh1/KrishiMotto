import { router, type Href } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { AskKrishiAiFab } from '@/components/navigation/ask-krishiai-fab';
import { Text } from '@/components/ui/text';
import { HomeHeroHeader } from '@/features/home/components/home-hero-header';
import { HomeServicesGrid } from '@/features/home/components/home-services-grid';
import { RequestedServicesSection } from '@/features/home/components/requested-services-section';
import { SmartContractsHomeSection } from '@/features/smart-contracts/components/smart-contracts-home-section';
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
    <View className="mb-4 flex-row items-start justify-between gap-2">
      <View className="min-w-0 flex-1 flex-row items-start gap-2.5">
        <View
          className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
        >
          <AppIcon name={icon} size={18} color={Palette.indiaGreen} />
        </View>
        <Text className="shrink text-[18px] font-bold leading-6 text-indigo">{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="shrink-0 flex-row items-center gap-1 rounded-full px-3 py-1.5"
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

            <SmartContractsHomeSection t={t} />
          </>
        )}
      </ScrollView>

      {!isLoading ? <AskKrishiAiFab label={t('home.dashboard.askAi')} /> : null}
    </View>
  );
}
