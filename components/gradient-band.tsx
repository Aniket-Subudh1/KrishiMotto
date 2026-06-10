import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { AppBarGradient } from '@/constants/theme';

type GradientBandProps = {
  className?: string;
};

export function GradientBand({ className = 'h-[5px]' }: GradientBandProps) {
  return (
    <View className={className}>
      <View className="absolute inset-0">
        <LinearGradient
          colors={[...AppBarGradient]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}
