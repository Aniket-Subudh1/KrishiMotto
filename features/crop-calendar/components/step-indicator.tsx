import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type StepIndicatorProps = {
  steps: readonly string[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View className="flex-row items-center gap-2">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <View key={label} className="min-w-0 flex-1 flex-row items-center gap-2">
            <View
              className="h-7 w-7 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: isActive || isComplete ? Palette.indiaGreen : 'rgba(255,255,255,0.25)',
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
            <Text
              className="min-w-0 flex-1 text-[10px] font-semibold"
              numberOfLines={1}
              style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.75)' }}
            >
              {label}
            </Text>
            {index < steps.length - 1 ? (
              <View
                className="h-0.5 w-3 shrink-0 rounded-full"
                style={{
                  backgroundColor: isComplete ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                }}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
