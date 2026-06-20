import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import {
  getSmartContractDetailRoute,
  getSmartContractStatusColor,
  isPledgeableContract,
  translateSmartContractStatus,
} from '@/features/smart-contracts/utils/display';
import { formatPaise } from '@/lib/currency';
import { Palette } from '@/constants/theme';
import type { FarmerSmartContract } from '@/types/credit';

type SmartContractCardProps = {
  contract: FarmerSmartContract;
  t: (key: string) => string;
  onPress?: () => void;
};

export function SmartContractCard({ contract, t, onPress }: SmartContractCardProps) {
  const statusColor = getSmartContractStatusColor(contract.status);
  const pledgeable = isPledgeableContract(contract);

  function handlePress() {
    if (onPress) {
      onPress();
      return;
    }
    router.push(getSmartContractDetailRoute(contract.id));
  }

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      <View
        className="overflow-hidden rounded-2xl border border-border bg-white"
        style={{
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        <View className={`h-1 ${pledgeable ? 'bg-india-green' : 'bg-border'}`} />
        <View className="gap-3 p-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1 flex-row items-start gap-3">
              <View
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: 'rgba(70, 150, 47, 0.12)' }}
              >
                <AppIcon name="file-document-outline" size={20} color={Palette.indiaGreen} />
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-[16px] font-bold text-indigo" numberOfLines={1}>
                  {contract.cropType}
                </Text>
                <Text className="mt-0.5 text-[13px] text-muted" numberOfLines={1}>
                  {contract.warehouse.name}
                </Text>
                <Text className="mt-1 text-[12px] font-medium text-indigo/80">
                  {contract.contractNumber}
                </Text>
              </View>
            </View>
            <View
              className="rounded-full px-2.5 py-1"
              style={{ backgroundColor: `${statusColor}18` }}
            >
              <Text className="text-[11px] font-semibold" style={{ color: statusColor }}>
                {translateSmartContractStatus(t, contract.status)}
              </Text>
            </View>
          </View>

          <View className="flex-row flex-wrap gap-2">
            <MetricChip
              label={t('smartContracts.totalKg')}
              value={`${contract.totalQuantityKg.toLocaleString('en-IN')} kg`}
            />
            <MetricChip
              label={t('smartContracts.freeKg')}
              value={`${contract.freeQuantityKg.toLocaleString('en-IN')} kg`}
              highlight={pledgeable}
            />
            <MetricChip label={t('smartContracts.valuation')} value={formatPaise(contract.valuationPaise)} />
          </View>

          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-2">
              {contract.registerTxHash ? (
                <>
                  <AppIcon name="link-variant" size={14} color={Palette.indiaGreen} />
                  <Text className="text-[12px] font-medium text-india-green">
                    {t('smartContracts.onChainBadge')}
                  </Text>
                </>
              ) : (
                <Text className="text-[12px] text-muted">{t('smartContracts.pendingAnchor')}</Text>
              )}
            </View>
            <AppIcon name="chevron-right" size={20} color={Palette.indiaGreen} />
          </View>

          {pledgeable ? (
            <View className="rounded-xl bg-saffron/10 px-3 py-2">
              <Text className="text-[12px] leading-5 text-indigo">
                {t('smartContracts.pledgeHint')}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

function MetricChip({
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
      <Text
        className={`text-[13px] font-bold ${highlight ? 'text-india-green' : 'text-indigo'}`}
      >
        {value}
      </Text>
    </View>
  );
}
