import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { RequestedServiceListItem } from '@/features/home/components/requested-service-card';
import { useRequestedServices } from '@/features/home/hooks/use-requested-services';
import { invalidateFarmerServiceQueries } from '@/lib/query-cache-sync';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useQueryFocusRefresh } from '@/hooks/use-query-focus-refresh';
import { useAuthStore } from '@/stores/auth.store';

export function RequestedServicesScreen() {
  const { t, locale } = useAppLocale();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const refreshServices = useCallback(
    () => invalidateFarmerServiceQueries(queryClient),
    [queryClient],
  );

  useQueryFocusRefresh(refreshServices, user?.role === 'FARMER');
  const { items, isLoading, isRefreshing, refetch } = useRequestedServices({ poll: true });

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
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
              {t('home.dashboard.requestedServicesTitle')}
            </Text>
            <Text className="mt-0.5 text-[13px] text-white/85">
              {t('home.dashboard.requestedServicesSubtitle')}
            </Text>
          </View>
          {items.length > 0 ? (
            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-[12px] font-semibold text-white">{items.length}</Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Palette.indiaGreen} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-5"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refetch} />}
        >
          {items.length === 0 ? (
            <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12">
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: 'rgba(26, 54, 93, 0.08)' }}
              >
                <AppIcon name="clipboard-text-clock-outline" size={28} color={Palette.indigo} />
              </View>
              <Text className="mt-4 text-center text-[16px] font-bold text-indigo">
                {t('home.dashboard.noRequestedServices')}
              </Text>
              <Text className="mt-2 text-center text-[14px] leading-5 text-muted">
                {t('home.dashboard.noRequestedServicesHint')}
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {items.map((item) => (
                <RequestedServiceListItem
                  key={
                    item.kind === 'booking'
                      ? `booking-${item.booking.id}`
                      : item.kind === 'loan'
                        ? `loan-${item.loan.id}`
                        : `storage-${item.request.id}`
                  }
                  item={item}
                  t={t}
                  locale={locale}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}
