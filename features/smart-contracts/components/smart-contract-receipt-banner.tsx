import { router } from 'expo-router';
import { Linking, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import {
  getSmartContractDetailRoute,
  isPledgeableContract,
} from '@/features/smart-contracts/utils/display';
import { formatPaise } from '@/lib/currency';
import { Palette } from '@/constants/theme';
import type { FarmerSmartContract } from '@/types/credit';

type SmartContractReceiptBannerProps = {
  contract: FarmerSmartContract;
  t: (key: string) => string;
  variant?: 'cropTracker' | 'default';
};

export function SmartContractReceiptBanner({
  contract,
  t,
  variant = 'default',
}: SmartContractReceiptBannerProps) {
  const pledgeable = isPledgeableContract(contract);

  return (
    <View className="overflow-hidden rounded-2xl border border-india-green/30 bg-india-green/5">
      <View className="h-1 bg-india-green" />
      <View className="gap-4 p-4">
        <View className="flex-row items-start gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-xl bg-white">
            <AppIcon name="file-document-outline" size={22} color={Palette.indiaGreen} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="text-[12px] font-semibold uppercase tracking-wide text-india-green">
              {t('smartContracts.receiptCreatedBadge')}
            </Text>
            <Text className="mt-1 text-[17px] font-bold text-indigo">
              {variant === 'cropTracker'
                ? t('smartContracts.cropTrackerReceiptTitle')
                : t('smartContracts.receiptReadyTitle')}
            </Text>
            <Text className="mt-1 text-[13px] leading-5 text-muted">
              {t('smartContracts.receiptReadyBody')}
            </Text>
          </View>
        </View>

        <View className="rounded-xl bg-white/90 px-3 py-3">
          <View className="flex-row flex-wrap gap-x-4 gap-y-2">
            <ReceiptFact label={t('smartContracts.contractNumber')} value={contract.contractNumber} />
            <ReceiptFact
              label={t('smartContracts.totalKg')}
              value={`${contract.totalQuantityKg.toLocaleString('en-IN')} kg`}
            />
            <ReceiptFact
              label={t('smartContracts.freeKg')}
              value={`${contract.freeQuantityKg.toLocaleString('en-IN')} kg`}
            />
            <ReceiptFact label={t('smartContracts.valuation')} value={formatPaise(contract.valuationPaise)} />
          </View>
        </View>

        {contract.registerTxHash ? (
          <Pressable
            onPress={() => {
              if (contract.explorerUrl) void Linking.openURL(contract.explorerUrl);
            }}
            disabled={!contract.explorerUrl}
            className="flex-row items-center gap-2 rounded-xl border border-india-green/20 bg-white px-3 py-2.5"
          >
            <AppIcon name="link-variant" size={16} color={Palette.indiaGreen} />
            <View className="min-w-0 flex-1">
              <Text className="text-[13px] font-semibold text-india-green">
                {t('smartContracts.viewOnChain')}
              </Text>
              <Text className="text-[11px] text-muted" numberOfLines={1}>
                {contract.receiptId}
              </Text>
            </View>
          </Pressable>
        ) : null}

        <View className="flex-row gap-3">
          <Button
            size="md"
            variant="secondary"
            className="flex-1"
            onPress={() => router.push(getSmartContractDetailRoute(contract.id))}
          >
            {t('smartContracts.viewReceipt')}
          </Button>
          {pledgeable ? (
            <Button size="md" className="flex-1" onPress={() => router.push('/services/ppacs-credit')}>
              {t('smartContracts.applyCredit')}
            </Button>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function ReceiptFact({ label, value }: { label: string; value: string }) {
  return (
    <View className="min-w-[45%] flex-1">
      <Text className="text-[10px] font-medium uppercase tracking-wide text-muted">{label}</Text>
      <Text className="text-[14px] font-semibold text-indigo">{value}</Text>
    </View>
  );
}
