import { Image } from 'expo-image';
import { Redirect } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';

import { GradientBand } from '@/components/gradient-band';
import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { OverviewTab } from '@/features/home/components/overview-tab';
import { useFarmerHome } from '@/features/home/context/farmer-home-context';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthStore } from '@/stores/auth.store';

export default function HomeScreen() {
  const { t } = useAppLocale();
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role === 'FARMER') {
    return <FarmerHomeScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <GradientBand className="absolute top-0 left-0 right-0 h-[5px]" />
      <View className="flex-1 px-6">
        <View className="w-full max-w-[360px] flex-1 items-center justify-center self-center">
          <View className="h-[173px] w-[260px]">
            <Image
              source={require('@/assets/images/logo.png')}
              style={{ width: '100%', height: '100%' }}
              contentFit="contain"
            />
          </View>
          <Text className="mb-2 mt-7 w-full text-center text-[32px] font-bold tracking-[0.3px] text-indigo">
            Krishi Motto
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
      <GradientBand className="absolute bottom-0 left-0 right-0 h-[5px]" />
    </View>
  );
}

function FarmerHomeScreen() {
  const { t } = useAppLocale();
  const { profile, parcels, isLoading, isRefreshing, onRefresh } = useFarmerHome();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting.morning');
    if (hour < 17) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  }, [t]);

  return (
    <OverviewTab
      profile={profile}
      parcels={parcels}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      greeting={greeting}
      t={t}
    />
  );
}
