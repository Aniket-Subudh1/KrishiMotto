import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateScheduleActivity } from '@/lib/booking-i18n';
import { parseLocalIsoDate } from '@/lib/date';
import { Palette } from '@/constants/theme';
import type { ScheduledActivity } from '@/types/booking';

const ACTIVITY_ICONS: Record<string, AppIconName> = {
  Sowing: 'seed-outline',
  '1st Irrigation': 'water',
  'Fertilizer (DAP)': 'flask-outline',
  'Fertilizer (Urea)': 'flask-outline',
  'Pest watch': 'bug-outline',
};

const DOT_COLORS = [
  Palette.indiaGreen,
  '#3B82F6',
  Palette.saffron,
  Palette.marigold,
  Palette.indigo,
] as const;

type ScheduleTimelineProps = {
  title: string;
  badge?: string;
  activities: ScheduledActivity[];
  emptyLabel: string;
  emptyHint?: string;
  activitiesCountLabel?: string;
  onGenerate?: () => void;
  generateLabel?: string;
  generating?: boolean;
};

function getActivityIcon(name: string): AppIconName {
  if (ACTIVITY_ICONS[name]) return ACTIVITY_ICONS[name];
  if (name.startsWith('Harvest')) return 'basket-outline';
  return 'calendar-month-outline';
}

function formatActivityDate(isoDate: string): string {
  const date = parseLocalIsoDate(isoDate);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatMonthLabel(isoDate: string): string {
  return parseLocalIsoDate(isoDate).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
}

export function ScheduleTimeline({
  title,
  badge,
  activities,
  emptyLabel,
  emptyHint,
  activitiesCountLabel,
  onGenerate,
  generateLabel,
  generating,
}: ScheduleTimelineProps) {
  const { t } = useAppLocale();

  if (!activities.length) {
    return (
      <View className="overflow-hidden rounded-2xl border border-dashed border-border bg-surface">
        <View className="items-center px-5 py-8">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-white">
            <AppIcon name="calendar-month-outline" size={28} color={Palette.indigo} />
          </View>
          <Text className="mt-4 text-center text-[15px] font-semibold text-indigo">{emptyLabel}</Text>
          {emptyHint ? (
            <Text className="mt-1.5 text-center text-[13px] leading-5 text-muted">{emptyHint}</Text>
          ) : null}
          {onGenerate && generateLabel ? (
            <Pressable
              onPress={onGenerate}
              disabled={generating}
              className="mt-5 min-h-[48px] flex-row items-center justify-center gap-2 rounded-2xl bg-india-green px-5 py-3"
            >
              {generating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <AppIcon name="auto-fix" size={18} color="#FFFFFF" />
              )}
              <Text className="text-[15px] font-semibold text-white">{generateLabel}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    );
  }

  let lastMonth = '';

  return (
    <View
      className="overflow-hidden rounded-2xl border border-border bg-white"
      style={{
        shadowColor: Palette.indigo,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="h-[3px] overflow-hidden">
        <LinearGradient
          colors={[Palette.saffron, Palette.indiaGreen]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </View>

      <View className="flex-row items-center justify-between border-b border-border px-4 py-3.5">
        <View>
          <Text className="text-[16px] font-bold text-indigo">{title}</Text>
          <Text className="mt-0.5 text-[12px] text-muted">
            {activitiesCountLabel ??
              t('cropCalendar.scheduleActivitiesCount').replace('{{count}}', String(activities.length))}
          </Text>
        </View>
        {badge ? (
          <View className="rounded-full bg-india-green/10 px-3 py-1">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-india-green">
              {badge}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="px-4 py-2">
        {activities.map((activity, index) => {
          const isLast = index === activities.length - 1;
          const dotColor = DOT_COLORS[index % DOT_COLORS.length];
          const monthLabel = formatMonthLabel(activity.date);
          const showMonth = monthLabel !== lastMonth;
          lastMonth = monthLabel;

          return (
            <View key={`${activity.name}-${activity.date}`}>
              {showMonth ? (
                <Text className="mb-2 mt-3 text-[11px] font-bold uppercase tracking-wider text-muted">
                  {monthLabel}
                </Text>
              ) : null}

              <View className="flex-row gap-3">
                <View className="items-center">
                  <View
                    className="h-9 w-9 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${dotColor}18` }}
                  >
                    <AppIcon name={getActivityIcon(activity.name)} size={16} color={dotColor} />
                  </View>
                  {!isLast ? (
                    <View className="my-1 w-0.5 flex-1 rounded-full bg-border" />
                  ) : null}
                </View>

                <View className={`min-w-0 flex-1 ${isLast ? 'pb-2' : 'pb-5'}`}>
                  <Text className="text-[15px] font-semibold text-indigo">
                    {translateScheduleActivity(t, activity.name)}
                  </Text>
                  <Text className="mt-0.5 text-[13px] text-muted">{formatActivityDate(activity.date)}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {onGenerate && generateLabel ? (
        <View className="border-t border-border bg-surface px-4 py-3">
          <Pressable
            onPress={onGenerate}
            disabled={generating}
            className="min-h-[44px] flex-row items-center justify-center gap-2 rounded-xl border border-india-green/30 bg-white px-4 py-2.5"
          >
            {generating ? (
              <ActivityIndicator size="small" color={Palette.indiaGreen} />
            ) : (
              <AppIcon name="refresh" size={16} color={Palette.indiaGreen} />
            )}
            <Text className="text-[14px] font-semibold text-india-green">{generateLabel}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
