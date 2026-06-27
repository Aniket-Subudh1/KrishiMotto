import { ActivityIndicator, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { useResolvedAssignedExpert } from '@/features/bookings/hooks/use-resolved-assigned-expert';
import { expertInitial } from '@/lib/assigned-expert-display';

type AssignedExpertSource = {
  expertId?: string | null;
  expertName?: string | null;
};

type AssignedExpertBadgeProps = AssignedExpertSource & {
  t: (key: string) => string;
  tone: 'light' | 'onGradient';
};

type AssignedExpertChipProps = AssignedExpertSource;

type AssignedExpertCardProps = AssignedExpertSource & {
  t: (key: string) => string;
};

function ExpertAvatar({
  name,
  size = 'md',
  tone = 'light',
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'onGradient';
}) {
  const onGradient = tone === 'onGradient';
  const dimensions =
    size === 'sm' ? 'h-5 w-5' : size === 'lg' ? 'h-12 w-12 rounded-2xl' : 'h-9 w-9';

  return (
    <View
      className={`${dimensions} items-center justify-center rounded-full`}
      style={{
        backgroundColor: onGradient ? 'rgba(255,255,255,0.22)' : 'rgba(70, 150, 47, 0.12)',
      }}
    >
      <Text
        className={`font-bold ${size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-[18px]' : 'text-[14px]'}`}
        style={{ color: onGradient ? '#FFFFFF' : Palette.indiaGreen }}
      >
        {expertInitial(name)}
      </Text>
    </View>
  );
}

export function AssignedExpertBadge({ expertId, expertName, t, tone }: AssignedExpertBadgeProps) {
  const { name, specialisation, isLoading } = useResolvedAssignedExpert({ expertId, expertName });

  if (!expertId) {
    return null;
  }

  if (isLoading) {
    return (
      <View
        className={`mt-3 flex-row items-center gap-3 rounded-xl px-3 py-2.5 ${
          tone === 'onGradient' ? 'bg-white/12' : 'border border-border bg-surface'
        }`}
      >
        <ActivityIndicator size="small" color={tone === 'onGradient' ? '#FFFFFF' : Palette.indiaGreen} />
        <Text
          className="text-[13px] font-medium"
          style={{ color: tone === 'onGradient' ? 'rgba(255,255,255,0.85)' : '#64748B' }}
        >
          {t('bookingDetail.loadingExpert')}
        </Text>
      </View>
    );
  }

  if (!name) {
    return null;
  }

  const onGradient = tone === 'onGradient';

  return (
    <View
      className={`mt-3 flex-row items-center gap-3 rounded-xl px-3 py-2.5 ${
        onGradient ? 'bg-white/12' : 'border border-india-green/15 bg-india-green/4'
      }`}
    >
      <ExpertAvatar name={name} tone={tone} />
      <View className="min-w-0 flex-1">
        <Text
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: onGradient ? 'rgba(255,255,255,0.72)' : '#64748B' }}
        >
          {t('bookingDetail.assignedExpert')}
        </Text>
        <Text
          className="text-[14px] font-bold leading-5"
          style={{ color: onGradient ? '#FFFFFF' : Palette.indigo }}
          numberOfLines={1}
        >
          {name}
        </Text>
        {specialisation ? (
          <Text
            className="mt-0.5 text-[12px] leading-4"
            style={{ color: onGradient ? 'rgba(255,255,255,0.72)' : '#64748B' }}
            numberOfLines={1}
          >
            {specialisation}
          </Text>
        ) : null}
      </View>
      <AppIcon
        name="account-check-outline"
        size={18}
        color={onGradient ? '#FFFFFF' : Palette.indiaGreen}
      />
    </View>
  );
}

export function AssignedExpertCompactRow({
  expertId,
  expertName,
  t,
  tone,
}: AssignedExpertBadgeProps) {
  const { name, isLoading } = useResolvedAssignedExpert({ expertId, expertName });

  if (!expertId || (!isLoading && !name)) {
    return null;
  }

  return (
    <View className="mt-2 flex-row items-center gap-1.5">
      {isLoading ? (
        <ActivityIndicator size="small" color={Palette.indiaGreen} />
      ) : name ? (
        <>
          <ExpertAvatar name={name} size="sm" tone={tone} />
          <Text className="flex-1 text-[12px] font-medium text-indigo" numberOfLines={1}>
            {name}
          </Text>
        </>
      ) : null}
    </View>
  );
}

export function AssignedExpertChip({ expertId, expertName }: AssignedExpertChipProps) {
  const { name, isLoading } = useResolvedAssignedExpert({ expertId, expertName });

  if (!expertId || isLoading || !name) {
    return null;
  }

  return (
    <View className="mt-2.5 flex-row items-center gap-2 self-start rounded-full border border-india-green/20 bg-india-green/6 px-2.5 py-1.5">
      <ExpertAvatar name={name} size="sm" />
      <Text className="text-[13px] font-semibold text-indigo" numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

export function AssignedExpertCard({ expertId, expertName, t }: AssignedExpertCardProps) {
  const { name, specialisation, isLoading } = useResolvedAssignedExpert({ expertId, expertName });

  if (!expertId) {
    return null;
  }

  if (isLoading) {
    return (
      <View className="mt-4 rounded-2xl border border-border bg-surface p-4">
        <View className="flex-row items-center gap-3">
          <ActivityIndicator size="small" color={Palette.indiaGreen} />
          <Text className="text-[14px] text-muted">{t('bookingDetail.loadingExpert')}</Text>
        </View>
      </View>
    );
  }

  if (!name) {
    return null;
  }

  return (
    <View className="mt-4 rounded-2xl border border-india-green/20 bg-india-green/4 p-4">
      <View className="flex-row items-center gap-3">
        <ExpertAvatar name={name} size="lg" />
        <View className="min-w-0 flex-1">
          <Text className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            {t('bookingDetail.assignedExpert')}
          </Text>
          <Text className="mt-0.5 text-[18px] font-bold text-indigo" numberOfLines={2}>
            {name}
          </Text>
          {specialisation ? (
            <Text className="mt-0.5 text-[13px] text-muted" numberOfLines={1}>
              {specialisation}
            </Text>
          ) : null}
          <Text className="mt-1 text-[13px] leading-5 text-muted">
            {t('bookingDetail.expertHandlingRequest').replace('{{name}}', name)}
          </Text>
        </View>
        <AppIcon name="account-check-outline" size={22} color={Palette.indiaGreen} />
      </View>
    </View>
  );
}
