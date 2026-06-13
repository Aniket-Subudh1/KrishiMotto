import { Redirect, Tabs } from 'expo-router';

import { AppTabBar } from '@/components/navigation/app-tab-bar';
import { Colors } from '@/constants/theme';
import { FarmerHomeProvider } from '@/features/home/context/farmer-home-context';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthStore } from '@/stores/auth.store';

export default function TabLayout() {
  const { t } = useAppLocale();
  const user = useAuthStore((s) => s.user);
  const isFarmer = user?.role === 'FARMER';

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  return (
    <FarmerHomeProvider>
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: Colors.background },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: isFarmer ? t('home.tabs.home') : 'Home',
          }}
        />
        <Tabs.Screen
          name="land"
          options={{
            title: t('home.tabs.land'),
            href: isFarmer ? undefined : null,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: t('home.tabs.tools'),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('home.tabs.profile'),
            href: isFarmer ? undefined : null,
          }}
        />
      </Tabs>
    </FarmerHomeProvider>
  );
}
