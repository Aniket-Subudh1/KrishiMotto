import { View } from 'react-native';

import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type StepIndicatorProps = {
  steps: readonly string[];
  currentStep: number;
};

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <View className="flex-row items-start gap-1">
      {steps.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <View key={label} className="min-w-0 flex-1 items-center">
            <View className="w-full flex-row items-center">
              <View className="flex-1 items-center">
                <View
                  className="h-7 w-7 items-center justify-center rounded-full"
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
              </View>
              {index < steps.length - 1 ? (
                <View
                  className="h-0.5 flex-1 rounded-full"
                  style={{
                    backgroundColor: isComplete ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                    marginTop: 14,
                  }}
                />
              ) : null}
            </View>
            <FittedText
              className="mt-1.5 w-full px-0.5 text-center text-[10px] font-semibold leading-4"
              style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.75)' }}
            >
              {label}
            </FittedText>
          </View>
        );
      })}
    </View>
  );
}
