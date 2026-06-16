import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { useStorageDashboard } from '@/features/storage/hooks/use-storage-request';
import { useAppLocale } from '@/hooks/use-app-locale';
import { formatPaise } from '@/lib/currency';
import { formatDate } from '@/lib/format';
import type { StorageRequest } from '@/types/storage';

type StorageDashboardProps = {
  request: StorageRequest;
};

function SensorCard({
  label,
  value,
  unit,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View className="flex-1 rounded-2xl border border-border bg-white p-3.5">
      <View className="mb-2 flex-row items-center gap-2">
        <Ionicons name={icon} size={16} color={Palette.indiaGreen} />
        <Text className="text-[12px] font-medium text-muted">{label}</Text>
      </View>
      <Text className="text-[22px] font-bold text-indigo">
        {value}
        <Text className="text-[14px] font-semibold text-muted">{unit}</Text>
      </Text>
    </View>
  );
}

export function StorageDashboard({ request }: StorageDashboardProps) {
  const { t } = useAppLocale();
  const { data: dashboard, isLoading, isError } = useStorageDashboard(request.id, true);

  if (isLoading) {
    return (
      <View className="items-center py-10">
        <ActivityIndicator size="small" color={Palette.indiaGreen} />
        <Text className="mt-3 text-[14px] text-muted">{t('cropTracker.loadingDashboard')}</Text>
      </View>
    );
  }

  if (isError || !dashboard) {
    return (
      <View className="rounded-2xl border border-border bg-surface px-4 py-5">
        <Text className="text-center text-[14px] text-muted">{t('cropTracker.dashboardError')}</Text>
      </View>
    );
  }

  const { sensorReadings, aiForecast, location, priceReference } = dashboard;

  return (
    <View className="gap-4">
      <View className="rounded-2xl border border-border bg-white p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              {t('cropTracker.liveStatus')}
            </Text>
            <Text className="mt-1 text-[20px] font-bold text-indigo">{dashboard.statusLabel}</Text>
            <Text className="mt-1 text-[13px] text-muted">
              {location.warehouseName} · {location.binId}
            </Text>
          </View>
          <View className="rounded-full bg-india-green/10 px-3 py-1">
            <Text className="text-[12px] font-semibold text-india-green">
              {dashboard.quantityLabel}
            </Text>
          </View>
        </View>
        <Text className="mt-3 text-[12px] text-muted">
          {t('cropTracker.lastUpdated', { time: formatDate(dashboard.lastUpdated) })}
        </Text>
      </View>

      <View className="flex-row gap-3">
        <SensorCard
          label={t('cropTracker.sensors.temperature')}
          value={sensorReadings.temperature.value}
          unit={sensorReadings.temperature.unit}
          icon="thermometer-outline"
        />
        <SensorCard
          label={t('cropTracker.sensors.humidity')}
          value={sensorReadings.humidity.value}
          unit={sensorReadings.humidity.unit}
          icon="water-outline"
        />
        <SensorCard
          label={t('cropTracker.sensors.co2')}
          value={sensorReadings.co2.value}
          unit={sensorReadings.co2.unit}
          icon="cloud-outline"
        />
      </View>

      <View className="rounded-2xl border border-border bg-white p-4">
        <Text className="text-[14px] font-bold text-indigo">{t('cropTracker.aiForecast')}</Text>
        <View className="mt-3 gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-[13px] text-muted">{t('cropTracker.spoilageRisk')}</Text>
            <Text className="text-[13px] font-semibold text-india-green">{aiForecast.spoilageRisk}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[13px] text-muted">{t('cropTracker.qualityGrade')}</Text>
            <Text className="text-[13px] font-semibold text-indigo">{aiForecast.qualityGrade}</Text>
          </View>
          <View className="flex-row items-center justify-between">
            <Text className="text-[13px] text-muted">{t('cropTracker.forecastWindow')}</Text>
            <Text className="text-[13px] font-semibold text-indigo">{aiForecast.forecastWindow}</Text>
          </View>
        </View>
      </View>

      <View className="rounded-2xl border border-dashed border-india-green/40 bg-surface px-4 py-4">
        <Text className="text-[13px] font-semibold text-indigo">{t('cropTracker.valuation')}</Text>
        <Text className="mt-1 text-[18px] font-bold text-india-green">
          {formatPaise(priceReference.amountPaise)}
        </Text>
        <Text className="mt-1 text-[12px] text-muted">{priceReference.label}</Text>
      </View>
    </View>
  );
}
