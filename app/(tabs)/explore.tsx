import { Redirect } from 'expo-router';

import { ToolsTab } from '@/features/home/components/tools-tab';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthStore } from '@/stores/auth.store';

export default function ExploreScreen() {
  const { t } = useAppLocale();
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  return <ToolsTab isFarmer={user.role === 'FARMER'} t={t} />;
}
