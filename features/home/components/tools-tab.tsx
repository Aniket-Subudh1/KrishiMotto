import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { QUICK_ACTIONS } from '@/features/home/constants/services';
import { ToolsCatalogSection } from '@/features/home/components/tools-catalog-section';
import { ToolsHeroHeader } from '@/features/home/components/tools-hero-header';
import { showComingSoonAlert } from '@/lib/coming-soon';
import { Palette } from '@/constants/theme';
import type { FarmerProfile } from '@/types/farmer';

type ToolsTabProps = {
  isFarmer: boolean;
  profile?: FarmerProfile;
  parcelCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  t: (key: string) => string;
};

export function ToolsTab({
  isFarmer,
  profile,
  parcelCount,
  isRefreshing,
  onRefresh,
  t,
}: ToolsTabProps) {
  const quickActions = QUICK_ACTIONS.filter((action) => !action.farmerOnly || isFarmer);
  const [serviceCounts, setServiceCounts] = useState({ bookable: 0, total: 0 });

  const handleCountsChange = useCallback((counts: { bookable: number; total: number }) => {
    setServiceCounts(counts);
  }, []);

  const aiInsight = profile?.primaryCrop
    ? t('home.dashboard.aiInsightCrop').replace('{{crop}}', profile.primaryCrop)
    : parcelCount > 0
      ? t('home.tools.aiInsightReady')
      : t('home.dashboard.aiInsightDefault');

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-28"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <ToolsHeroHeader
          quickActionCount={quickActions.length}
          bookableCount={serviceCounts.bookable}
          totalServiceCount={serviceCounts.total}
          t={t}
        />

        {quickActions.length > 0 ? (
          <View className="mt-6 px-5">
            <Text className="mb-1 text-[18px] font-bold text-indigo">
              {t('home.tools.quickActions')}
            </Text>
            <Text className="mb-3 text-[13px] leading-5 text-muted">
              {t('home.tools.quickActionsBody')}
            </Text>
            <View className="gap-3">
              {quickActions.map((action) => (
                <QuickActionCard key={action.key} action={action} t={t} />
              ))}
            </View>
          </View>
        ) : null}

        <ToolsCatalogSection t={t} onCountsChange={handleCountsChange} />

        <View className="mt-6 px-5">
          <View
            className="rounded-2xl border border-border px-4 py-4"
            style={{ backgroundColor: 'rgba(26, 54, 93, 0.05)' }}
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="information-circle-outline" size={18} color={Palette.indigo} />
              <Text className="text-[14px] font-bold text-indigo">{t('home.tools.howItWorks')}</Text>
            </View>
            <Text className="mt-2 text-[13px] leading-5 text-muted">
              {t('home.tools.howItWorksSteps')}
            </Text>
          </View>
        </View>

        <View className="mt-5 px-5">
          <Pressable onPress={() => showComingSoonAlert(t)}>
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
                <Text className="mt-0.5 text-[13px] leading-5 text-muted">{aiInsight}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </Pressable>
        </View>
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

function QuickActionCard({
  action,
  t,
}: {
  action: (typeof QUICK_ACTIONS)[number];
  t: (key: string) => string;
}) {
  return (
    <Pressable
      onPress={() => {
        if (action.href) {
          router.push(action.href);
        }
      }}
    >
      <View
        className="flex-row items-center gap-4 overflow-hidden rounded-2xl border border-border bg-white p-4"
        style={{
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: action.iconBg }}
        >
          <Ionicons name={action.icon} size={22} color={action.iconColor} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[16px] font-bold text-indigo">{t(action.titleKey)}</Text>
          <Text className="mt-1 text-[13px] leading-5 text-muted" numberOfLines={2}>
            {t(action.badgeKey)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
      </View>
    </Pressable>
  );
}
