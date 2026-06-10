import { Image } from 'expo-image';
import { View } from 'react-native';

import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { useAppLocale } from '@/hooks/use-app-locale';

export default function HomeScreen() {
  const { t } = useAppLocale();

  return (
    <View className="flex-1 bg-background px-6 pb-[88px]">
      <View className="w-full max-w-[360px] flex-1 items-center justify-center self-center">
        <View className="h-[173px] w-[260px]">
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
          />
        </View>
        <Text className="mb-2 mt-7 w-full text-center text-[32px] font-bold tracking-[0.3px] text-indigo">
          KrishiMotto
        </Text>
        <FittedText
          fit
          shrink
          maxLines={2}
          minScale={0.85}
          className="w-full text-center text-[17px] font-medium leading-6 text-india-green"
        >
          {t('home.tagline')}
        </FittedText>
      </View>
    </View>
  );
}
