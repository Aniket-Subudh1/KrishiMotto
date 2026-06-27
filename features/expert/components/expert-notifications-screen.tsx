import { Redirect, router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';

import { ErrorBanner } from '@/components/auth/auth-screen-layout';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  getExpertOrderError,
  useExpertNotifications,
  useMarkExpertNotificationRead,
} from '@/features/expert/hooks/use-expert-orders';
import { getExpertNotificationRoute } from '@/features/expert/utils/expert-order-display';
import { formatBookingDate } from '@/features/home/utils/booking-display';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useManualRefresh } from '@/hooks/use-manual-refresh';
import { useQueryFocusRefresh } from '@/hooks/use-query-focus-refresh';
import { invalidateExpertMarketplaceQueries } from '@/lib/query-cache-sync';
import { useAuthStore } from '@/stores/auth.store';
import type { ExpertNotification } from '@/types/expert-booking';

export function ExpertNotificationsScreen() {
  const { t, locale } = useAppLocale();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isExpert = user?.role === 'EXPERT';
  const refreshNotifications = useCallback(
    () => invalidateExpertMarketplaceQueries(queryClient),
    [queryClient],
  );

  useQueryFocusRefresh(refreshNotifications, isExpert);
  const { data, isLoading, refetch, error } = useExpertNotifications(undefined, {
    poll: isExpert,
    enabled: isExpert,
  });
  const { isRefreshing, onRefresh } = useManualRefresh(() => refetch());
  const markRead = useMarkExpertNotificationRead();
  const items = data?.items ?? [];
  const errorMessage = error ? getExpertOrderError(error, t('bookingDetail.loadError')) : null;

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'EXPERT') {
    return <Redirect href="/(tabs)" />;
  }

  async function handlePress(notification: ExpertNotification) {
    try {
      if (!notification.readAt) {
        await markRead.mutateAsync(notification.id);
      }

      const route = getExpertNotificationRoute(notification);
      if (route) {
        router.push(route as `/expert-orders/${string}`);
      }
    } catch {
      // Keep the feed usable even if mark-read fails.
      const route = getExpertNotificationRoute(notification);
      if (route) {
        router.push(route as `/expert-orders/${string}`);
      }
    }
  }

  return (
    <View className="flex-1 bg-background">
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
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            accessibilityRole="button"
          >
            <AppIcon name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          <View className="min-w-0 flex-1">
            <Text className="text-[22px] font-bold text-white">
              {t('expertDashboard.notifications.title')}
            </Text>
            <Text className="mt-0.5 text-[13px] text-white/85">
              {t('expertDashboard.notifications.subtitle')}
            </Text>
          </View>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Palette.indiaGreen} />
        </View>
      ) : errorMessage ? (
        <View className="flex-1 px-5 pt-5">
          <ErrorBanner message={errorMessage} />
          <Button size="lg" className="mt-4" onPress={() => void refetch()}>
            {t('expertDashboard.retry')}
          </Button>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-5"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
          }
        >
          {items.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12">
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgba(26, 54, 93, 0.08)' }}
              >
                <AppIcon name="bell-outline" size={28} color={Palette.indigo} />
              </View>
              <Text className="mt-4 text-center text-[16px] font-bold text-indigo">
                {t('expertDashboard.notifications.empty')}
              </Text>
              <Text className="mt-2 text-center text-[14px] leading-5 text-muted">
                {t('expertDashboard.notifications.emptyHint')}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {items.map((notification) => (
                <NotificationRow
                  key={notification.id}
                  notification={notification}
                  locale={locale}
                  onPress={() => void handlePress(notification)}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function NotificationRow({
  notification,
  locale,
  onPress,
}: {
  notification: ExpertNotification;
  locale: string;
  onPress: () => void;
}) {
  const isUnread = !notification.readAt;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      className="rounded-2xl border border-border bg-white p-4"
    >
      <View className="flex-row items-start gap-3">
        <View
          className="h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{
            backgroundColor: isUnread ? 'rgba(70, 150, 47, 0.12)' : 'rgba(26, 54, 93, 0.08)',
          }}
        >
          <AppIcon
            name={isUnread ? 'bell-badge-outline' : 'bell-outline'}
            size={20}
            color={isUnread ? Palette.indiaGreen : Palette.indigo}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-bold leading-5 text-indigo" numberOfLines={2}>
            {notification.title}
          </Text>
          <Text className="mt-1 text-[13px] leading-5 text-muted" numberOfLines={4}>
            {notification.body}
          </Text>
          <Text className="mt-2 text-[12px] text-muted">
            {formatBookingDate(notification.createdAt, locale)}
          </Text>
        </View>
        {isUnread ? (
          <View className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-india-green" />
        ) : null}
      </View>
    </Pressable>
  );
}
