import { router } from 'expo-router';
import { View } from 'react-native';

import { GradientBand } from '@/components/gradient-band';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';

export default function SignInScreen() {
  return (
    <Screen edges={['top', 'bottom']} className="bg-background">
      <GradientBand className="absolute top-0 left-0 right-0 h-[5px]" />

      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-2 text-center text-[28px] font-bold text-indigo">
          Welcome back
        </Text>
        <Text className="mb-8 text-center text-[15px] leading-[22px] text-muted">
          Sign in with your phone number to continue to KrishiMotto.
        </Text>
        <Text className="text-center text-[14px] text-muted">
          Sign-in flow coming soon.
        </Text>
      </View>

      <View className="px-6 pb-6">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onPress={() => router.replace('/(tabs)')}
        >
          Continue to Home
        </Button>
      </View>

      <GradientBand className="absolute bottom-0 left-0 right-0 h-[5px]" />
    </Screen>
  );
}
