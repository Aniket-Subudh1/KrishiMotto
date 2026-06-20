import { AppIcon } from '@/components/ui/app-icon';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { StorageDashboard } from '@/features/crop-tracker/components/storage-dashboard';
import { StorageStatusTimeline } from '@/features/crop-tracker/components/storage-status-timeline';
import { useCropTrackerAccess } from '@/features/crop-tracker/hooks/use-crop-tracker';
import { SmartContractReceiptBanner } from '@/features/smart-contracts/components/smart-contract-receipt-banner';
import { useFarmerSmartContracts } from '@/features/smart-contracts/hooks/use-smart-contracts';
import { findSmartContractByStorageRequest } from '@/features/smart-contracts/utils/display';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateCropType, translateStorageStatus } from '@/lib/booking-i18n';
import { formatPaise } from '@/lib/currency';
import { getStorageRoute } from '@/features/home/utils/storage-display';
import { useAuthStore } from '@/stores/auth.store';
import type { CropType } from '@/types/booking';

export function CropTrackerScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const {
    requests,
    latestRequest,
    trackableRequest,
    pendingPaymentRequest,
    hasStorageRequest,
    canTrack,
    isLoading,
    isRefetching,
    refetch,
  } = useCropTrackerAccess();
  const { data: smartContracts = [] } = useFarmerSmartContracts();

  const activeReceipt = trackableRequest
    ? findSmartContractByStorageRequest(smartContracts, trackableRequest.id)
    : undefined;

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  const activeRequest = trackableRequest ?? latestRequest;

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
            accessibilityRole="button"
          >
            <AppIcon name="chevron-left" size={22} color="#FFFFFF" />
          </Pressable>
        </View>

        <View className="mt-4 flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <AppIcon name="chart-timeline-variant" size={24} color="#FFFFFF" />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[26px] font-bold text-white">{t('cropTracker.title')}</Text>
            <Text className="mt-0.5 text-[14px] text-white/85">{t('cropTracker.subtitle')}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8 pt-5"
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
        }
      >
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="small" color={Palette.indiaGreen} />
          </View>
        ) : !hasStorageRequest ? (
          <View className="gap-5">
            <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-5 py-10">
              <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-marigold/15">
                <AppIcon name="lock-outline" size={28} color={Palette.marigold} />
              </View>
              <Text className="text-center text-[18px] font-bold text-indigo">
                {t('cropTracker.lockedTitle')}
              </Text>
              <Text className="mt-2 text-center text-[14px] leading-5 text-muted">
                {t('cropTracker.lockedBody')}
              </Text>
            </View>
            <Button onPress={() => router.push('/services/storage')}>
              {t('cropTracker.optStorage')}
            </Button>
          </View>
        ) : canTrack && trackableRequest ? (
          <View className="gap-5">
            {activeReceipt ? (
              <SmartContractReceiptBanner
                contract={activeReceipt}
                t={t}
                variant="cropTracker"
              />
            ) : trackableRequest.status === 'IN_STORAGE' ? (
              <View className="rounded-2xl border border-dashed border-india-green/30 bg-india-green/5 px-4 py-4">
                <Text className="text-[14px] font-semibold text-indigo">
                  {t('smartContracts.cropTrackerPendingReceiptTitle')}
                </Text>
                <Text className="mt-1 text-[13px] leading-5 text-muted">
                  {t('smartContracts.cropTrackerPendingReceiptBody')}
                </Text>
              </View>
            ) : null}

            <View className="rounded-2xl border border-border bg-white p-4">
              <Text className="text-[12px] font-semibold uppercase tracking-wide text-muted">
                {t('cropTracker.tracking')}
              </Text>
              <Text className="mt-1 text-[18px] font-bold text-indigo">
                {translateCropType(t, trackableRequest.cropType as CropType)}
              </Text>
              <Text className="mt-1 text-[13px] text-muted">
                {trackableRequest.quantityKg.toLocaleString('en-IN')} kg ·{' '}
                {trackableRequest.requestNumber}
              </Text>
            </View>
            <StorageDashboard request={trackableRequest} />
          </View>
        ) : pendingPaymentRequest ? (
          <View className="gap-5">
            <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-5 py-10">
              <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-marigold/15">
                <AppIcon name="credit-card-outline" size={28} color={Palette.marigold} />
              </View>
              <Text className="text-center text-[18px] font-bold text-indigo">
                {t('cropTracker.paymentPendingTitle')}
              </Text>
              <Text className="mt-2 text-center text-[14px] leading-5 text-muted">
                {t('cropTracker.paymentPendingBody')}
              </Text>
              <Text className="mt-4 text-[13px] font-semibold text-india-green">
                {pendingPaymentRequest.requestNumber}
              </Text>
            </View>
            <Button onPress={() => router.push(getStorageRoute(pendingPaymentRequest))}>
              {t('cropTracker.completePayment')}
            </Button>
          </View>
        ) : activeRequest ? (
          <View className="gap-5">
            <View className="rounded-2xl border border-border bg-white p-4">
              <Text className="text-[16px] font-bold text-indigo">{t('cropTracker.pendingTitle')}</Text>
              <Text className="mt-2 text-[14px] leading-5 text-muted">
                {t('cropTracker.pendingBody')}
              </Text>
              <View className="mt-4 rounded-xl bg-surface px-3 py-3">
                <Text className="text-[13px] leading-5 text-muted">
                  {t('smartContracts.pendingStorageHint')}
                </Text>
              </View>
              <View className="mt-4 flex-row flex-wrap gap-2">
                <StatusPill
                  label={translateStorageStatus(t, activeRequest.status)}
                />
                <StatusPill
                  label={`${activeRequest.quantityKg.toLocaleString('en-IN')} kg`}
                  muted
                />
                <StatusPill label={formatPaise(activeRequest.valuationPaise)} muted />
              </View>
            </View>

            <View className="rounded-2xl border border-border bg-white p-4">
              <Text className="mb-4 text-[15px] font-bold text-indigo">
                {t('cropTracker.statusTimeline')}
              </Text>
              <StorageStatusTimeline request={activeRequest} />
            </View>

            {requests.length > 1 ? (
              <View className="rounded-2xl border border-border bg-surface px-4 py-3">
                <Text className="text-[13px] text-muted">
                  {t('cropTracker.otherRequests', { count: requests.length - 1 })}
                </Text>
              </View>
            ) : null}

            <Button variant="secondary" onPress={() => router.push('/services/storage')}>
              {t('cropTracker.addStorage')}
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function StatusPill({ label, muted }: { label: string; muted?: boolean }) {
  return (
    <View
      className={`rounded-full px-3 py-1 ${muted ? 'bg-surface' : 'bg-india-green/10'}`}
    >
      <Text
        className={`text-[12px] font-semibold ${muted ? 'text-muted' : 'text-india-green'}`}
      >
        {label}
      </Text>
    </View>
  );
}
