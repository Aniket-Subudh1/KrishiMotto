import { View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { useAppLocale } from '@/hooks/use-app-locale';
import { translateCropType, translateSeason } from '@/lib/booking-i18n';
import { Palette } from '@/constants/theme';
import { formatAcres } from '@/lib/format';
import { parseLocalIsoDate } from '@/lib/date';
import { resolveAppIcon, type IconName } from '@/lib/icon-names';
import type { LandParcel } from '@/types/farmer';
import type { CropCalendarFormValues } from '@/features/crop-calendar/utils/validate-form';

type ReviewSummaryProps = {
  form: CropCalendarFormValues;
  parcel: LandParcel | undefined;
  activityCount: number;
  labels: {
    title: string;
    field: string;
    crop: string;
    season: string;
    duration: string;
    activities: string;
  };
};

function formatShortDate(isoDate: string): string {
  return parseLocalIsoDate(isoDate).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function SummaryRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3 py-2.5">
      <View className="mt-0.5 h-8 w-8 items-center justify-center rounded-xl bg-india-green/10">
        <AppIcon name={resolveAppIcon(icon)} size={16} color={Palette.indiaGreen} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</Text>
        <Text className="mt-0.5 text-[15px] font-semibold text-indigo">{value}</Text>
      </View>
    </View>
  );
}

export function ReviewSummary({ form, parcel, activityCount, labels }: ReviewSummaryProps) {
  const { t } = useAppLocale();
  const duration = `${formatShortDate(form.startDate)} → ${formatShortDate(form.endDate)}`;

  return (
    <View
      className="overflow-hidden rounded-2xl border border-border bg-white"
      style={{
        shadowColor: Palette.indigo,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View className="border-b border-border bg-surface px-4 py-3">
        <Text className="text-[15px] font-bold text-indigo">{labels.title}</Text>
        <Text className="mt-0.5 text-[13px] text-muted">{form.projectTitle}</Text>
      </View>

      <View className="px-4">
        <SummaryRow
          icon="map-outline"
          label={labels.field}
          value={parcel ? `${parcel.name} · ${formatAcres(parcel.areaAcres)}` : '—'}
        />
        <View className="h-px bg-border" />
        <SummaryRow
          icon="leaf-outline"
          label={labels.crop}
          value={`${form.cropName} · ${translateCropType(t, form.cropType)}`}
        />
        <View className="h-px bg-border" />
        <SummaryRow
          icon="calendar-outline"
          label={labels.season}
          value={translateSeason(t, form.season)}
        />
        <View className="h-px bg-border" />
        <SummaryRow icon="time-outline" label={labels.duration} value={duration} />
        <View className="h-px bg-border" />
        <SummaryRow
          icon="list-outline"
          label={labels.activities}
          value={String(activityCount)}
        />
      </View>
    </View>
  );
}
