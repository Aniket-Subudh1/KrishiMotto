import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { formatPaise } from '@/lib/currency';
import { Palette } from '@/constants/theme';
import type { FarmerSmartContract } from '@/types/credit';

type SmartContractPickerProps = {
  t: (key: string) => string;
  label: string;
  hint?: string;
  emptyMessage: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  contracts: FarmerSmartContract[];
  selectedId: string | null;
  onSelect: (contractId: string) => void;
  loading?: boolean;
  error?: string;
};

export function SmartContractPicker({
  t,
  label,
  hint,
  emptyMessage,
  emptyActionLabel,
  onEmptyAction,
  contracts,
  selectedId,
  onSelect,
  loading,
  error,
}: SmartContractPickerProps) {
  if (loading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator size="small" color={Palette.indiaGreen} />
      </View>
    );
  }

  return (
    <View className="gap-2.5">
      <View>
        <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>
        {hint ? <Text className="mt-0.5 text-[12px] text-muted">{hint}</Text> : null}
      </View>

      {contracts.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-border bg-surface px-4 py-5">
          <Text className="text-center text-[14px] leading-5 text-muted">{emptyMessage}</Text>
          {emptyActionLabel && onEmptyAction ? (
            <Pressable onPress={onEmptyAction} className="mt-3 self-center rounded-full bg-india-green px-4 py-2">
              <Text className="text-[13px] font-semibold text-white">{emptyActionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 pr-1"
        >
          {contracts.map((contract) => {
            const selected = contract.id === selectedId;
            return (
              <Pressable
                key={contract.id}
                onPress={() => onSelect(contract.id)}
                className={`w-[240px] overflow-hidden rounded-2xl border bg-white ${
                  selected ? 'border-india-green bg-surface' : 'border-border'
                }`}
              >
                <View className={`h-1 ${selected ? 'bg-india-green' : 'bg-transparent'}`} />
                <View className="gap-2 p-4">
                  <View className="flex-row items-start justify-between gap-2">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'rgba(70, 150, 47, 0.12)' }}
                    >
                      <AppIcon name="file-document-outline" size={18} color={Palette.indiaGreen} />
                    </View>
                    {selected ? (
                      <View className="h-5 w-5 items-center justify-center rounded-full bg-india-green">
                        <AppIcon name="check" size={12} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-[15px] font-bold text-indigo" numberOfLines={1}>
                    {contract.cropType}
                  </Text>
                  <Text className="text-[12px] text-muted" numberOfLines={1}>
                    {contract.warehouse.name}
                  </Text>
                  <Text className="text-[12px] font-medium text-india-green">
                    {t('ppacsCredit.receiptPickerFree')
                      .replace('{{free}}', contract.freeQuantityKg.toLocaleString('en-IN'))
                      .replace('{{number}}', contract.contractNumber)}
                  </Text>
                  <Text className="text-[11px] text-muted">
                    {t('ppacsCredit.receiptPickerValuation').replace(
                      '{{amount}}',
                      formatPaise(contract.valuationPaise),
                    )}
                  </Text>
                  {contract.registerTxHash ? (
                    <View className="flex-row items-center gap-1">
                      <AppIcon name="link-variant" size={12} color={Palette.indiaGreen} />
                      <Text className="text-[11px] font-medium text-india-green">
                        {t('smartContracts.onChainBadge')}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {error ? (
        <View className="flex-row items-center gap-1.5 px-1">
          <AppIcon name="alert-circle-outline" size={13} color="#EF4444" />
          <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
