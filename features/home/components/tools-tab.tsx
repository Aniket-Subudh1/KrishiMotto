import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { AskKrishiAiFab } from '@/components/navigation/ask-krishiai-fab';
import { Text } from '@/components/ui/text';
import { QUICK_ACTIONS } from '@/features/home/constants/services';
import { ToolsCatalogSection } from '@/features/home/components/tools-catalog-section';
import { ToolsHeroHeader } from '@/features/home/components/tools-hero-header';
import { Palette } from '@/constants/theme';
import { resolveAppIcon } from '@/lib/icon-names';
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
  isRefreshing,
  onRefresh,
  t,
}: ToolsTabProps) {
  const quickActions = QUICK_ACTIONS.filter((action) => !action.farmerOnly || isFarmer);
  const [serviceCounts, setServiceCounts] = useState({ bookable: 0, total: 0 });

  const handleCountsChange = useCallback((counts: { bookable: number; total: number }) => {
    setServiceCounts(counts);
  }, []);

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
            <View className="mb-4 flex-row items-center gap-2.5">
              <View
                className="h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(233, 175, 67, 0.12)' }}
              >
                <AppIcon name="flash-outline" size={18} color={Palette.marigold} />
              </View>
              <View className="flex-1">
                <Text className="text-[18px] font-bold text-indigo">
                  {t('home.tools.quickActions')}
                </Text>
                <Text className="mt-0.5 text-[13px] leading-5 text-muted">
                  {t('home.tools.quickActionsBody')}
                </Text>
              </View>
            </View>
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
              <AppIcon name="information-outline" size={18} color={Palette.indigo} />
              <Text className="text-[14px] font-bold text-indigo">{t('home.tools.howItWorks')}</Text>
            </View>
            <Text className="mt-2 text-[13px] leading-5 text-muted">
              {t('home.tools.howItWorksSteps')}
            </Text>
          </View>
        </View>
      </ScrollView>

      <AskKrishiAiFab label={t('home.dashboard.askAi')} />
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
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
    >
      <View
        className="flex-row items-center gap-4 overflow-hidden rounded-2xl border border-border bg-white p-4"
        style={{
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: action.iconBg }}
        >
          <AppIcon name={resolveAppIcon(action.icon)} size={24} color={action.iconColor} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[16px] font-bold text-indigo">{t(action.titleKey)}</Text>
          <Text className="mt-1 text-[13px] leading-5 text-muted" numberOfLines={2}>
            {t(action.badgeKey)}
          </Text>
        </View>
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
        >
          <AppIcon name="chevron-right" size={20} color={Palette.indiaGreen} />
        </View>
      </View>
    </Pressable>
  );
}
