import { Redirect, router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, BackHandler, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AuthScreenLayout } from '@/components/auth/auth-screen-layout';
import { AuthRedirect } from '@/components/auth/auth-redirect';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useExpertKycStatus, useExpertProfile } from '@/features/expert/hooks/use-expert-auth';
import { useLogout } from '@/features/auth/hooks/use-auth';
import { useAppLocale } from '@/hooks/use-app-locale';
import { applyAuthCompletion, deriveAuthCompletion } from '@/lib/auth-routing';
import { formatExpertApplicationRef } from '@/lib/format';
import { Palette } from '@/constants/theme';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';

const POLL_INTERVAL_MS = 15_000;

export default function ExpertPendingScreen() {
  const { t } = useAppLocale();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const signupStep = useAuthFlowStore((s) => s.signupStep);
  const logout = useLogout();

  const { data: kycStatus, isLoading } = useExpertKycStatus(
    isAuthenticated && user?.role === 'EXPERT',
    POLL_INTERVAL_MS,
  );
  const { data: expertProfile } = useExpertProfile(
    isAuthenticated && user?.role === 'EXPERT',
  );

  const applicationRef = formatExpertApplicationRef(
    user?.id ?? '',
    expertProfile?.phone ?? user?.phoneNumber,
  );

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!kycStatus?.applicable || !user) {
      return;
    }

    const status = kycStatus;

    async function handleStatusChange() {
      if (status.approved) {
        const derived = await deriveAuthCompletion(
          user!,
          useAuthFlowStore.getState().signupStep,
        );
        applyAuthCompletion(derived.profileCompleted, derived.signupStep);
        router.replace('/(tabs)' as Href);
        return;
      }

      if (status.status === 'REJECTED') {
        const derived = await deriveAuthCompletion(
          user!,
          useAuthFlowStore.getState().signupStep,
        );
        applyAuthCompletion(derived.profileCompleted, derived.signupStep);
        router.replace('/expert/sign-up' as Href);
      }
    }

    void handleStatusChange();
  }, [kycStatus, user]);

  if (!isAuthenticated || !user) {
    return <Redirect href="/get-started" />;
  }

  if (user.role !== 'EXPERT') {
    return <AuthRedirect />;
  }

  if (signupStep !== 'pending') {
    return <AuthRedirect />;
  }

  const isRejected = kycStatus?.applicable && kycStatus.status === 'REJECTED';

  return (
    <AuthScreenLayout
      showBackButton={false}
      title={isRejected ? t('expertPending.rejectedTitle') : t('expertPending.title')}
      subtitle={
        isRejected ? t('expertPending.rejectedSubtitle') : t('expertPending.subtitle')
      }
      footer={
        <View className="gap-3">
          {isRejected ? (
            <Button
              size="lg"
              className="w-full"
              onPress={() => router.replace('/expert/sign-up' as Href)}
            >
              {t('expertPending.resubmit')}
            </Button>
          ) : null}
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            loading={logout.isPending}
            onPress={() => logout.mutate()}
          >
            {t('expertPending.logout')}
          </Button>
        </View>
      }
    >
      <View className="items-center gap-6 py-4">
        <View
          className="h-24 w-24 items-center justify-center rounded-full"
          style={{
            backgroundColor: isRejected
              ? 'rgba(220, 38, 38, 0.1)'
              : 'rgba(244, 164, 96, 0.16)',
          }}
        >
          {isLoading ? (
            <ActivityIndicator size="large" color={Palette.saffron} />
          ) : (
            <Ionicons
              name={isRejected ? 'close-circle-outline' : 'time-outline'}
              size={48}
              color={isRejected ? '#dc2626' : Palette.saffron}
            />
          )}
        </View>

        <View className="gap-2">
          <Text className="text-center text-[15px] leading-[22px] text-muted">
            {isRejected
              ? t('expertPending.rejectedBody')
              : t('expertPending.body')}
          </Text>
          {!isRejected ? (
            <Text className="text-center text-[13px] leading-[19px] text-muted">
              {t('expertPending.pollingHint')}
            </Text>
          ) : null}
        </View>

        {applicationRef ? (
          <View className="w-full rounded-xl border border-border bg-surface px-4 py-3">
            <Text className="text-[12px] font-medium uppercase tracking-wide text-muted">
              {t('expertPending.referenceLabel')}
            </Text>
            <Text className="mt-1 text-[18px] font-bold tracking-wide text-indigo">
              {applicationRef}
            </Text>
          </View>
        ) : null}
      </View>
    </AuthScreenLayout>
  );
}
