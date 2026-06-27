import { AppIcon } from '@/components/ui/app-icon';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { ErrorBanner } from '@/components/auth/auth-screen-layout';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SmartContractExplainer } from '@/features/smart-contracts/components/smart-contract-explainer';
import { StorageReceiptTrustDeedCard } from '@/features/smart-contracts/components/storage-receipt-trust-deed-card';
import { useFarmerSmartContract } from '@/features/smart-contracts/hooks/use-smart-contracts';
import { useStorageRequest } from '@/features/storage/hooks/use-storage-request';
import {
  getSmartContractStatusColor,
  isPledgeableContract,
  translateEventType,
  translateSmartContractStatus,
} from '@/features/smart-contracts/utils/display';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useQueryFocusRefresh } from '@/hooks/use-query-focus-refresh';
import { invalidateFarmerServiceQueries } from '@/lib/query-cache-sync';
import { formatPaise } from '@/lib/currency';
import { formatDate } from '@/lib/format';
import { useAuthStore } from '@/stores/auth.store';

export function SmartContractDetailScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { id } = useLocalSearchParams<{ id: string }>();
  const contractId = typeof id === 'string' ? id : '';
  const refreshContract = useCallback(
    () => invalidateFarmerServiceQueries(queryClient),
    [queryClient],
  );

  useQueryFocusRefresh(refreshContract, user?.role === 'FARMER' && Boolean(contractId));
  const { data: contract, isLoading, isRefetching, refetch, error } = useFarmerSmartContract(
    contractId || null,
    { poll: true },
  );
  const { data: storageRequest, isLoading: storageLoading } = useStorageRequest(
    contract?.storageRequestId ?? null,
    { poll: true },
  );
  const trustDeedUrl = storageRequest?.publicReceiptUrl;
  const trustDeedQrId = storageRequest?.qrId;

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  const statusColor = contract ? getSmartContractStatusColor(contract.status) : Palette.indigo;
  const pledgeable = contract ? isPledgeableContract(contract) : false;

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 24 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
        >
          <AppIcon name="chevron-left" size={22} color="#FFFFFF" />
        </Pressable>
        <View className="mt-4">
          <Text className="text-[26px] font-bold text-white">{t('smartContracts.detailTitle')}</Text>
          <Text className="mt-1 text-[14px] text-white/85">
            {contract?.contractNumber ?? t('smartContracts.detailLoading')}
          </Text>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Palette.indiaGreen} />
        </View>
      ) : error || !contract ? (
        <View className="flex-1 px-5 pt-5">
          <ErrorBanner message={t('smartContracts.detailError')} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pb-8 pt-5"
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
          }
        >
          <View className="rounded-2xl border border-border bg-white p-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="text-[22px] font-bold text-indigo">{contract.cropType}</Text>
                <Text className="mt-1 text-[14px] text-muted">{contract.warehouse.name}</Text>
              </View>
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: `${statusColor}18` }}
              >
                <Text className="text-[12px] font-semibold" style={{ color: statusColor }}>
                  {translateSmartContractStatus(t, contract.status)}
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-2">
              <FactPill label={t('smartContracts.totalKg')} value={`${contract.totalQuantityKg} kg`} />
              <FactPill
                label={t('smartContracts.pledgedKg')}
                value={`${contract.pledgedQuantityKg} kg`}
              />
              <FactPill
                label={t('smartContracts.freeKg')}
                value={`${contract.freeQuantityKg} kg`}
                highlight
              />
              <FactPill label={t('smartContracts.valuation')} value={formatPaise(contract.valuationPaise)} />
            </View>
          </View>

          <View className="mt-5">
            <SmartContractExplainer t={t} compact />
          </View>

          <View className="mt-5 rounded-2xl border border-border bg-white p-4">
            <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              {t('smartContracts.onChainSection')}
            </Text>
            <View className="mt-3 gap-3">
              <DetailRow label={t('smartContracts.receiptId')} value={contract.receiptId} />
              <DetailRow label={t('smartContracts.contractNumber')} value={contract.contractNumber} />
              {contract.binId ? (
                <DetailRow label={t('smartContracts.binId')} value={contract.binId} />
              ) : null}
              {contract.registerTxHash ? (
                <Pressable
                  onPress={() => {
                    if (contract.explorerUrl) void Linking.openURL(contract.explorerUrl);
                  }}
                  disabled={!contract.explorerUrl}
                  className="rounded-xl border border-india-green/20 bg-india-green/5 px-3 py-3"
                >
                  <View className="flex-row items-center gap-2">
                    <AppIcon name="link-variant" size={16} color={Palette.indiaGreen} />
                    <View className="min-w-0 flex-1">
                      <Text className="text-[13px] font-semibold text-india-green">
                        {t('smartContracts.viewOnChain')}
                      </Text>
                      <Text className="text-[11px] text-muted" numberOfLines={1}>
                        {contract.registerTxHash}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ) : (
                <Text className="text-[13px] text-muted">{t('smartContracts.pendingAnchor')}</Text>
              )}
            </View>
          </View>

          {trustDeedUrl && trustDeedQrId ? (
            <View className="mt-5">
              <Text className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted">
                {t('smartContracts.trustDeedSection')}
              </Text>
              <StorageReceiptTrustDeedCard
                qrId={trustDeedQrId}
                publicReceiptUrl={trustDeedUrl}
                warehouseName={contract.warehouse.name}
                cropType={contract.cropType}
                contractNumber={contract.contractNumber}
                receiptId={contract.receiptId}
                quantityKg={contract.totalQuantityKg}
                valuationLabel={formatPaise(contract.valuationPaise)}
                t={t}
              />
            </View>
          ) : !storageLoading ? (
            <View className="mt-5 rounded-2xl border border-dashed border-border bg-surface px-4 py-4">
              <Text className="text-[13px] leading-5 text-muted">
                {t('smartContracts.trustDeedPending')}
              </Text>
            </View>
          ) : null}

          {contract.events.length > 0 ? (
            <View className="mt-5 rounded-2xl border border-border bg-white p-4">
              <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
                {t('smartContracts.timelineTitle')}
              </Text>
              <View className="mt-4 gap-4">
                {contract.events.map((event, index) => (
                  <View key={`${event.type}-${event.at}-${index}`} className="flex-row gap-3">
                    <View className="mt-1 h-2 w-2 rounded-full bg-india-green" />
                    <View className="min-w-0 flex-1">
                      <Text className="text-[14px] font-semibold text-indigo">
                        {translateEventType(t, event.type)}
                      </Text>
                      <Text className="text-[12px] text-muted">
                        {formatDate(event.at)}
                        {event.quantityKg != null ? ` · ${event.quantityKg} kg` : ''}
                      </Text>
                      {event.note ? (
                        <Text className="mt-1 text-[12px] leading-5 text-muted">{event.note}</Text>
                      ) : null}
                      {event.txHash && event.explorerUrl ? (
                        <Pressable
                          onPress={() => void Linking.openURL(event.explorerUrl!)}
                          className="mt-2 flex-row items-center gap-1"
                        >
                          <AppIcon name="link-variant" size={14} color={Palette.indiaGreen} />
                          <Text className="text-[12px] font-semibold text-india-green">
                            {t('smartContracts.viewOnChain')}
                          </Text>
                        </Pressable>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          <View className="mt-6 gap-3">
            {pledgeable ? (
              <Button size="lg" onPress={() => router.push('/services/ppacs-credit')}>
                {t('smartContracts.applyCredit')}
              </Button>
            ) : (
              <View className="rounded-2xl border border-border bg-surface px-4 py-3">
                <Text className="text-[13px] leading-5 text-muted">
                  {t('smartContracts.notPledgeableHint')}
                </Text>
              </View>
            )}
            <Button size="lg" variant="secondary" onPress={() => router.push('/services/crop-tracker')}>
              {t('smartContracts.openCropTracker')}
            </Button>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function FactPill({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View className={`rounded-xl px-3 py-2 ${highlight ? 'bg-india-green/10' : 'bg-surface'}`}>
      <Text className="text-[10px] font-medium uppercase tracking-wide text-muted">{label}</Text>
      <Text className={`text-[14px] font-bold ${highlight ? 'text-india-green' : 'text-indigo'}`}>
        {value}
      </Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[11px] text-muted">{label}</Text>
      <Text className="text-[14px] font-medium text-indigo">{value}</Text>
    </View>
  );
}
