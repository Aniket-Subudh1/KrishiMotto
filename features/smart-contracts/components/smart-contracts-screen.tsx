import { AppIcon } from '@/components/ui/app-icon';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SmartContractCard } from '@/features/smart-contracts/components/smart-contract-card';
import { SmartContractExplainer } from '@/features/smart-contracts/components/smart-contract-explainer';
import { useFarmerSmartContracts } from '@/features/smart-contracts/hooks/use-smart-contracts';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthStore } from '@/stores/auth.store';

export function SmartContractsScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const { data: contracts = [], isLoading, isRefetching, refetch } = useFarmerSmartContracts();

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
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <AppIcon name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
          {contracts.length > 0 ? (
            <View className="rounded-full bg-white/20 px-3 py-1">
              <Text className="text-[12px] font-semibold text-white">
                {t('smartContracts.countBadge').replace('{{count}}', String(contracts.length))}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <AppIcon name="file-document-outline" size={24} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[26px] font-bold text-white">{t('smartContracts.title')}</Text>
            <Text className="mt-0.5 text-[14px] text-white/85">{t('smartContracts.subtitle')}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-5"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }
      >
        <SmartContractExplainer t={t} />

        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="small" color={Palette.indiaGreen} />
          </View>
        ) : contracts.length === 0 ? (
          <View className="mt-5 items-center gap-4 rounded-2xl border border-dashed border-border bg-surface px-5 py-10">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-marigold/15">
              <AppIcon name="warehouse" size={30} color={Palette.marigold} />
            </View>
            <Text className="text-center text-[18px] font-bold text-indigo">
              {t('smartContracts.emptyTitle')}
            </Text>
            <Text className="text-center text-[14px] leading-6 text-muted">
              {t('smartContracts.emptyBody')}
            </Text>
            <Button className="w-full" onPress={() => router.push('/services/storage')}>
              {t('smartContracts.startStorage')}
            </Button>
          </View>
        ) : (
          <View className="mt-5 gap-3">
            {contracts.map((contract) => (
              <SmartContractCard key={contract.id} contract={contract} t={t} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
