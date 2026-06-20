import { ActivityIndicator, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type ExpertMarketplaceStateProps = {
  t: (key: string) => string;
};

type ExpertMarketplaceErrorProps = ExpertMarketplaceStateProps & {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
};

export function ExpertMarketplaceLoading() {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator size="large" color={Palette.indiaGreen} />
    </View>
  );
}

export function ExpertMarketplaceEmpty({
  icon,
  title,
  message,
}: {
  icon: string;
  title: string;
  message: string;
}) {
  return (
    <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-12">
      <View
        className="h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: 'rgba(26, 54, 93, 0.08)' }}
      >
        <AppIcon name={icon as 'briefcase-search-outline'} size={28} color={Palette.indigo} />
      </View>
      <Text className="mt-4 text-center text-[16px] font-bold text-indigo">{title}</Text>
      <Text className="mt-2 text-center text-[14px] leading-5 text-muted">{message}</Text>
    </View>
  );
}

export function ExpertMarketplaceError({
  title,
  message,
  onRetry,
  retryLabel,
  secondaryActionLabel,
  onSecondaryAction,
}: ExpertMarketplaceErrorProps) {
  return (
    <View className="items-center rounded-2xl border border-border bg-white px-6 py-10">
      <View
        className="h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
      >
        <AppIcon name="cloud-alert-outline" size={32} color="#EF4444" />
      </View>
      <Text className="mt-4 text-center text-[18px] font-bold text-indigo">{title}</Text>
      <Text className="mt-2 text-center text-[14px] leading-5 text-muted">{message}</Text>
      {onRetry ? (
        <Button size="lg" className="mt-5 w-full" onPress={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
      {secondaryActionLabel && onSecondaryAction ? (
        <Button
          variant="secondary"
          size="lg"
          className="mt-3 w-full"
          onPress={onSecondaryAction}
        >
          {secondaryActionLabel}
        </Button>
      ) : null}
    </View>
  );
}

export function ExpertMarketplaceVerificationGate({
  t,
  onViewProfile,
}: ExpertMarketplaceStateProps & { onViewProfile?: () => void }) {
  return (
    <View className="items-center rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10">
      <View
        className="h-16 w-16 items-center justify-center rounded-2xl"
        style={{ backgroundColor: 'rgba(244, 164, 96, 0.16)' }}
      >
        <AppIcon name="shield-alert-outline" size={32} color={Palette.saffron} />
      </View>
      <Text className="mt-4 text-center text-[18px] font-bold text-indigo">
        {t('expertDashboard.errors.verificationRequiredTitle')}
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-5 text-muted">
        {t('expertDashboard.errors.verificationRequiredBody')}
      </Text>
      {onViewProfile ? (
        <Button variant="secondary" size="lg" className="mt-5 w-full" onPress={onViewProfile}>
          {t('expertDashboard.errors.viewProfile')}
        </Button>
      ) : null}
    </View>
  );
}

export function ExpertMarketplaceInlineNotice({
  icon,
  iconColor = Palette.saffron,
  iconBg = 'rgba(244, 164, 96, 0.12)',
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: string;
  iconColor?: string;
  iconBg?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="rounded-2xl border border-border bg-surface px-4 py-4">
      <View className="flex-row items-start gap-3">
        <View
          className="h-10 w-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <AppIcon name={icon as 'cloud-alert-outline'} size={20} color={iconColor} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[14px] font-bold text-indigo">{title}</Text>
          <Text className="mt-1 text-[13px] leading-5 text-muted">{message}</Text>
          {actionLabel && onAction ? (
            <Pressable onPress={onAction} className="mt-2 self-start">
              <Text className="text-[13px] font-semibold text-india-green">{actionLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export function ExpertMarketplaceSectionLoading() {
  return (
    <View className="items-center rounded-2xl border border-dashed border-border bg-surface px-4 py-8">
      <ActivityIndicator size="small" color={Palette.indiaGreen} />
    </View>
  );
}

export function ExpertMarketplaceLoadMore({
  loading,
  label,
}: {
  loading: boolean;
  label: string;
}) {
  if (loading) {
    return (
      <View className="items-center py-4">
        <ActivityIndicator size="small" color={Palette.indiaGreen} />
      </View>
    );
  }

  return (
    <Text className="py-3 text-center text-[12px] text-muted">{label}</Text>
  );
}
