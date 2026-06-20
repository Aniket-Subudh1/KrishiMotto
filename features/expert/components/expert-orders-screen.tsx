import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ExpertOrderCard } from '@/features/expert/components/expert-order-card';
import {
  ExpertMarketplaceEmpty,
  ExpertMarketplaceError,
  ExpertMarketplaceLoadMore,
  ExpertMarketplaceLoading,
} from '@/features/expert/components/expert-marketplace-states';
import { useExpertPollingScope } from '@/features/expert/context/expert-home-context';
import {
  getExpertMarketplaceError,
  useExpertOrdersInfinite,
} from '@/features/expert/hooks/use-expert-orders';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useManualRefresh } from '@/hooks/use-manual-refresh';
import { useAuthStore } from '@/stores/auth.store';
import type { ExpertBooking } from '@/types/expert-booking';

type ExpertOrdersScreenProps = {
  showBackButton?: boolean;
};

export function ExpertOrdersScreen({ showBackButton = false }: ExpertOrdersScreenProps) {
  const { t, locale } = useAppLocale();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const isExpert = user?.role === 'EXPERT';
  useExpertPollingScope('orders');

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    error,
  } = useExpertOrdersInfinite({
    enabled: isExpert,
  });

  const { isRefreshing, onRefresh } = useManualRefresh(() => refetch());

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data?.pages],
  );

  const errorContent = error ? getExpertMarketplaceError(error, t) : null;

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (!isExpert) {
    return <Redirect href="/(tabs)" />;
  }

  function handleLoadMore() {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }

  function renderHeader() {
    return (
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 24,
        }}
      >
        <View className="flex-row items-center gap-3">
          {showBackButton ? (
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
              accessibilityRole="button"
            >
              <AppIcon name="chevron-left" size={22} color="#FFFFFF" />
            </Pressable>
          ) : null}
          <View className="min-w-0 flex-1">
            <Text className="text-[22px] font-bold text-white">
              {t('expertDashboard.myOrders.title')}
            </Text>
            <Text className="mt-0.5 text-[13px] text-white/85">
              {t('expertDashboard.myOrders.subtitle')}
            </Text>
          </View>
          {items.length > 0 ? (
            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-[12px] font-semibold text-white">{items.length}</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>
    );
  }

  function renderListHeader() {
    if (isLoading) {
      return <ExpertMarketplaceLoading />;
    }

    if (errorContent) {
      return (
        <View className="pb-2 pt-5">
          <ExpertMarketplaceError
            t={t}
            title={errorContent.title}
            message={errorContent.message}
            retryLabel={t('expertDashboard.retry')}
            onRetry={() => void refetch()}
          />
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View className="pb-2 pt-5">
          <ExpertMarketplaceEmpty
            icon="clipboard-list-outline"
            title={t('expertDashboard.myOrders.empty')}
            message={t('expertDashboard.myOrders.emptyHint')}
          />
          <Button
            variant="secondary"
            size="lg"
            className="mt-4 w-full"
            onPress={() => router.push('/(tabs)/requests' as Href)}
          >
            {t('expertDashboard.myOrders.browseRequests')}
          </Button>
        </View>
      );
    }

    return <View className="h-5" />;
  }

  function renderItem({ item }: { item: ExpertBooking }) {
    return (
      <View className="pb-3">
        <ExpertOrderCard booking={item} t={t} locale={locale} variant="order" />
      </View>
    );
  }

  function renderFooter() {
    if (isLoading || errorContent || items.length === 0) {
      return null;
    }

    if (hasNextPage) {
      return (
        <View className="pb-4">
          {isFetchingNextPage ? (
            <ExpertMarketplaceLoadMore loading label="" />
          ) : (
            <Button variant="secondary" onPress={handleLoadMore}>
              {t('expertDashboard.myOrders.loadMore')}
            </Button>
          )}
        </View>
      );
    }

    return (
      <ExpertMarketplaceLoadMore
        loading={false}
        label={t('expertDashboard.myOrders.endOfList')}
      />
    );
  }

  return (
    <View className="flex-1 bg-background">
      {renderHeader()}
      <FlatList
        data={!isLoading && !errorContent ? items : []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderFooter}
        contentContainerClassName="px-5 pb-8"
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}
