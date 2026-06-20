import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type SmartContractExplainerProps = {
  t: (key: string) => string;
  compact?: boolean;
};

const STEPS = ['store', 'receipt', 'loan'] as const;

export function SmartContractExplainer({ t, compact }: SmartContractExplainerProps) {
  return (
    <View className={`rounded-2xl border border-india-green/20 bg-india-green/5 ${compact ? 'p-4' : 'p-5'}`}>
      <View className="flex-row items-start gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-white">
          <AppIcon name="shield-check-outline" size={20} color={Palette.indiaGreen} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-bold text-indigo">{t('smartContracts.explainerTitle')}</Text>
          <Text className="mt-1 text-[13px] leading-5 text-muted">
            {t('smartContracts.explainerBody')}
          </Text>
        </View>
      </View>

      {!compact ? (
        <View className="mt-4 gap-3">
          {STEPS.map((step, index) => (
            <View key={step} className="flex-row items-start gap-3">
              <View className="h-7 w-7 items-center justify-center rounded-full bg-india-green/15">
                <Text className="text-[12px] font-bold text-india-green">{index + 1}</Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-[14px] font-semibold text-indigo">
                  {t(`smartContracts.explainerSteps.${step}.title`)}
                </Text>
                <Text className="mt-0.5 text-[12px] leading-5 text-muted">
                  {t(`smartContracts.explainerSteps.${step}.body`)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
