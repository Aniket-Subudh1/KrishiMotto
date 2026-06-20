import { router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { SmartContractCard } from '@/features/smart-contracts/components/smart-contract-card';
import { useFarmerSmartContracts } from '@/features/smart-contracts/hooks/use-smart-contracts';
import { SMART_CONTRACTS_ROUTE } from '@/features/smart-contracts/utils/display';
import { Palette } from '@/constants/theme';

type SmartContractsHomeSectionProps = {
  t: (key: string) => string;
};

const PREVIEW_LIMIT = 2;

export function SmartContractsHomeSection({ t }: SmartContractsHomeSectionProps) {
  const { data: contracts = [], isLoading } = useFarmerSmartContracts();
  const preview = contracts.slice(0, PREVIEW_LIMIT);

  if (isLoading) {
    return (
      <View className="mt-7 px-5">
        <SectionHeader t={t} />
        <View className="items-center py-6">
          <ActivityIndicator size="small" color={Palette.indiaGreen} />
        </View>
      </View>
    );
  }

  if (!contracts.length) {
    return (
      <View className="mt-7 px-5">
        <SectionHeader t={t} />
        <Pressable
          onPress={() => router.push(SMART_CONTRACTS_ROUTE)}
          className="rounded-2xl border border-dashed border-india-green/30 bg-surface px-4 py-5"
        >
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-india-green/10">
              <AppIcon name="file-document-outline" size={20} color={Palette.indiaGreen} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="text-[15px] font-bold text-indigo">
                {t('smartContracts.homeEmptyTitle')}
              </Text>
              <Text className="mt-1 text-[13px] leading-5 text-muted">
                {t('smartContracts.homeEmptyBody')}
              </Text>
            </View>
            <AppIcon name="chevron-right" size={20} color={Palette.indiaGreen} />
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mt-7 px-5">
      <SectionHeader
        t={t}
        count={contracts.length}
        showViewAll={contracts.length > PREVIEW_LIMIT}
      />
      <View className="gap-3">
        {preview.map((contract) => (
          <SmartContractCard key={contract.id} contract={contract} t={t} />
        ))}
      </View>
    </View>
  );
}

function SectionHeader({
  t,
  count,
  showViewAll,
}: {
  t: (key: string) => string;
  count?: number;
  showViewAll?: boolean;
}) {
  return (
    <View className="mb-4 flex-row items-start justify-between gap-2">
      <View className="min-w-0 flex-1 flex-row items-start gap-2.5">
        <View
          className="mt-0.5 h-8 w-8 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
        >
          <AppIcon name="file-document-outline" size={18} color={Palette.indiaGreen} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[18px] font-bold leading-6 text-indigo">
            {t('smartContracts.homeSectionTitle')}
          </Text>
          <Text className="mt-0.5 text-[13px] leading-5 text-muted">
            {t('smartContracts.homeSectionSubtitle')}
          </Text>
        </View>
      </View>
      {showViewAll ? (
        <Pressable
          onPress={() => router.push(SMART_CONTRACTS_ROUTE)}
          className="shrink-0 flex-row items-center gap-1 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
        >
          <Text className="text-[13px] font-semibold text-india-green">
            {t('smartContracts.viewAll')}
          </Text>
          {count ? (
            <View className="rounded-full bg-india-green/15 px-1.5 py-0.5">
              <Text className="text-[11px] font-bold text-india-green">{count}</Text>
            </View>
          ) : null}
          <AppIcon name="arrow-right" size={14} color={Palette.indiaGreen} />
        </Pressable>
      ) : count && count <= PREVIEW_LIMIT ? (
        <Pressable
          onPress={() => router.push(SMART_CONTRACTS_ROUTE)}
          className="shrink-0 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
        >
          <AppIcon name="arrow-right" size={16} color={Palette.indiaGreen} />
        </Pressable>
      ) : null}
    </View>
  );
}
