import { View } from 'react-native';

import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type StepIndicatorProps = {
  steps: readonly string[];
  currentStep: number;
};

const TRACK_LINE = 'h-0.5 flex-1 rounded-full';

function trackLineColor(active: boolean) {
  return active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)';
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View className="flex-row">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;
        const isFirst = index === 0;
        const isLast = index === steps.length - 1;

        return (
          <View key={`${label}-${index}`} className="min-w-0 flex-1">
            <View className="flex-row items-center">
              <View
                className={TRACK_LINE}
                style={{
                  backgroundColor: isFirst ? 'transparent' : trackLineColor(index < currentStep),
                }}
              />
              <View
                className="h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{
                  backgroundColor:
                    isActive || isComplete ? Palette.indiaGreen : 'rgba(255,255,255,0.25)',
                }}
              >
                {isComplete ? (
                  <Text className="text-[12px] font-bold text-white">✓</Text>
                ) : (
                  <Text
                    className="text-[12px] font-bold"
                    style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>
              <View
                className={TRACK_LINE}
                style={{
                  backgroundColor: isLast ? 'transparent' : trackLineColor(isComplete),
                }}
              />
            </View>
            <FittedText
              className="mt-1.5 w-full px-0.5 text-center text-[10px] font-semibold leading-4"
              style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.75)' }}
              maxLines={2}
            >
              {label}
            </FittedText>
          </View>
        );
      })}
    </View>
  );
}
