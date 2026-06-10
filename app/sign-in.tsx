import { router } from 'expo-router';
import { View } from 'react-native';

import { GradientBand } from '@/components/gradient-band';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { FittedText } from '@/components/ui/fitted-text';
import { useAppLocale } from '@/hooks/use-app-locale';

export default function SignInScreen() {
  const { t } = useAppLocale();

  return (
    <Screen edges={['top', 'bottom']} className="bg-background">
      <GradientBand className="absolute top-0 left-0 right-0 h-[5px]" />

      <View className="flex-1 items-center justify-center px-6">
        <FittedText
          fit
          maxLines={2}
          minScale={0.8}
          className="mb-2 w-full text-center text-[28px] font-bold leading-8 text-indigo"
        >
          {t('signIn.welcomeBack')}
        </FittedText>
        <FittedText
          shrink
          maxLines={4}
          className="mb-8 w-full text-center text-[15px] leading-[22px] text-muted"
        >
          {t('signIn.subtitle')}
        </FittedText>
        <FittedText
          shrink
          maxLines={2}
          className="w-full text-center text-[14px] leading-5 text-muted"
        >
          {t('signIn.comingSoon')}
        </FittedText>
      </View>

      <View className="px-6 pb-6">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onPress={() => router.replace('/(tabs)')}
        >
          {t('signIn.continueHome')}
        </Button>
      </View>

      <GradientBand className="absolute bottom-0 left-0 right-0 h-[5px]" />
    </Screen>
  );
}
