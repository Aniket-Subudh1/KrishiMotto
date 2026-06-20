import { AppIcon } from '@/components/ui/app-icon';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBanner } from '@/components/auth/auth-screen-layout';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useLoanTrack } from '@/features/ppacs-credit/hooks/use-ppacs-credit';
import {
  getLoanStatusColor,
  translateLoanStatus,
} from '@/features/ppacs-credit/utils/loan-display';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { formatPaise } from '@/lib/currency';
import type { LoanMilestone, LoanMilestoneStatus } from '@/types/credit';

function milestoneColor(status: LoanMilestoneStatus): string {
  switch (status) {
    case 'done':
      return Palette.indiaGreen;
    case 'in_progress':
      return '#F59E0B';
    case 'failed':
      return '#EF4444';
    default:
      return '#94A3B8';
  }
}

function milestoneIcon(status: LoanMilestoneStatus) {
  switch (status) {
    case 'done':
      return 'check-circle';
    case 'in_progress':
      return 'clock-outline';
    case 'failed':
      return 'close-circle';
    default:
      return 'circle-outline';
  }
}

export function LoanTrackScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const loanId = typeof id === 'string' ? id : '';
  const { data, isLoading, isRefetching, refetch, error } = useLoanTrack(loanId || null);

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
        </View>
        <View className="mt-4">
          <Text className="text-[26px] font-bold text-white">{t('ppacsCredit.trackTitle')}</Text>
          <Text className="mt-1 text-[14px] text-white/85">
            {data?.loan.loanNumber ?? t('ppacsCredit.trackLoading')}
          </Text>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Palette.indiaGreen} />
        </View>
      ) : error || !data ? (
        <View className="flex-1 px-5 pt-5">
          <ErrorBanner message={t('ppacsCredit.trackError')} />
          <Button size="lg" className="mt-4" onPress={() => router.back()}>
            {t('ppacsCredit.back')}
          </Button>
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
            <View className="flex-row items-center justify-between gap-3">
              <View className="min-w-0 flex-1">
                <Text className="text-[12px] uppercase tracking-wide text-muted">
                  {t('ppacsCredit.loanAmount')}
                </Text>
                <Text className="text-[22px] font-bold text-indigo">
                  {formatPaise(data.loan.requestedAmountPaise)}
                </Text>
              </View>
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: `${getLoanStatusColor(data.loan.status)}18` }}
              >
                <Text
                  className="text-[12px] font-semibold"
                  style={{ color: getLoanStatusColor(data.loan.status) }}
                >
                  {translateLoanStatus(t, data.loan.status)}
                </Text>
              </View>
            </View>
            <Text className="mt-3 text-[14px] text-muted">
              {t('ppacsCredit.trackSummaryLine')
                .replace('{{lender}}', data.lender.name)
                .replace('{{crop}}', data.warehouseReceipt.cropType)
                .replace('{{quantity}}', String(data.warehouseReceipt.collateralQuantityKg))}
            </Text>
            {data.nextAction ? (
              <Text className="mt-3 text-[13px] leading-5 text-indigo">{data.nextAction}</Text>
            ) : null}
          </View>

          <View className="mt-5 rounded-2xl border border-border bg-white p-4">
            <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              {t('ppacsCredit.receiptSection')}
            </Text>
            <View className="mt-3 gap-2">
              <DetailLine label={t('ppacsCredit.contractNumber')} value={data.warehouseReceipt.contractNumber} />
              <DetailLine label={t('ppacsCredit.receiptId')} value={data.warehouseReceipt.receiptId} />
              <DetailLine
                label={t('ppacsCredit.collateralQuantityKg')}
                value={`${data.warehouseReceipt.collateralQuantityKg} kg`}
              />
              {data.warehouseReceipt.registerTxHash ? (
                <ExplorerLink
                  label={t('ppacsCredit.viewOnChain')}
                  url={data.warehouseReceipt.registerExplorerUrl}
                  txHash={data.warehouseReceipt.registerTxHash}
                />
              ) : null}
            </View>
          </View>

          <View className="mt-5 rounded-2xl border border-border bg-white p-4">
            <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
              {t('ppacsCredit.milestonesTitle')}
            </Text>
            <View className="mt-4 gap-4">
              {data.milestones.map((milestone) => (
                <MilestoneRow key={milestone.step} milestone={milestone} t={t} />
              ))}
            </View>
          </View>

          {data.kyc.kycHash ? (
            <View className="mt-5 rounded-2xl border border-border bg-surface p-4">
              <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
                {t('ppacsCredit.kycSection')}
              </Text>
              <Text className="mt-2 text-[12px] text-muted">{data.kyc.kycHash}</Text>
              {data.kyc.chainTxHash ? (
                <ExplorerLink
                  label={t('ppacsCredit.viewKycOnChain')}
                  url={data.kyc.chainExplorerUrl}
                  txHash={data.kyc.chainTxHash}
                />
              ) : null}
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-[11px] text-muted">{label}</Text>
      <Text className="text-[14px] font-medium text-indigo">{value}</Text>
    </View>
  );
}

function ExplorerLink({
  label,
  url,
  txHash,
}: {
  label: string;
  url?: string | null;
  txHash: string;
}) {
  const href = url ?? undefined;

  return (
    <Pressable
      disabled={!href}
      onPress={() => {
        if (href) void Linking.openURL(href);
      }}
      className="mt-2 flex-row items-center gap-2"
    >
      <AppIcon name="link-variant" size={16} color={Palette.indiaGreen} />
      <View className="min-w-0 flex-1">
        <Text className="text-[13px] font-semibold text-india-green">{label}</Text>
        <Text className="text-[11px] text-muted" numberOfLines={1}>
          {txHash}
        </Text>
      </View>
    </Pressable>
  );
}

function MilestoneRow({
  milestone,
  t,
}: {
  milestone: LoanMilestone;
  t: (key: string) => string;
}) {
  const color = milestoneColor(milestone.status);

  return (
    <View className="flex-row gap-3">
      <AppIcon name={milestoneIcon(milestone.status)} size={22} color={color} />
      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-semibold text-indigo">{milestone.label}</Text>
        <Text className="text-[12px] capitalize text-muted">
          {t(`ppacsCredit.milestoneStatuses.${milestone.status}`)}
        </Text>
        {milestone.note ? (
          <Text className="mt-1 text-[12px] leading-5 text-muted">{milestone.note}</Text>
        ) : null}
        {milestone.txHash ? (
          <ExplorerLink
            label={t('ppacsCredit.viewOnChain')}
            url={milestone.explorerUrl}
            txHash={milestone.txHash}
          />
        ) : null}
      </View>
    </View>
  );
}
