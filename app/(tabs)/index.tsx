import { Redirect } from 'expo-router';
import { useMemo } from 'react';

import { ExpertOverviewTab } from '@/features/expert/components/expert-overview-tab';
import { OverviewTab } from '@/features/home/components/overview-tab';
import { useFarmerHome } from '@/features/home/context/farmer-home-context';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthStore } from '@/stores/auth.store';

export default function HomeScreen() {
  const { t, locale } = useAppLocale();
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role === 'EXPERT') {
    return <ExpertHomeScreen />;
  }

  if (user.role !== 'FARMER') {
    return <Redirect href="/get-started" />;
  }

  return <FarmerHomeScreen t={t} locale={locale} />;
}

function ExpertHomeScreen() {
  const { t } = useAppLocale();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting.morning');
    if (hour < 17) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  }, [t]);

  return <ExpertOverviewTab greeting={greeting} />;
}

function FarmerHomeScreen({
  t,
  locale,
}: {
  t: (key: string) => string;
  locale: string;
}) {
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
      locale={locale}
      t={t}
    />
  );
}
