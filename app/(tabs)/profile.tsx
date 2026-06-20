import { Redirect } from 'expo-router';

import { ExpertProfileTab } from '@/features/expert/components/expert-profile-tab';
import { ProfileTab } from '@/features/home/components/profile-tab';
import { useFarmerHome } from '@/features/home/context/farmer-home-context';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthStore } from '@/stores/auth.store';

function FarmerProfileScreen() {
  const { t } = useAppLocale();
  const { profile, isLoading, isRefreshing, onRefresh } = useFarmerHome();

  return (
    <ProfileTab
      profile={profile}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      onRefresh={onRefresh}
      t={t}
    />
  );
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);

  if (user?.role === 'EXPERT') {
    return <ExpertProfileTab />;
  }

  if (user?.role !== 'FARMER') {
    return <Redirect href="/(tabs)" />;
  }

  return <FarmerProfileScreen />;
}
