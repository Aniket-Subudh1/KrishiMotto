import { ActivityIndicator, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import {
  formatQuantityLine,
  translateDashboardStatus,
  translatePriceReferenceLabel,
  translateQuantityStored,
} from '@/features/crop-tracker/utils/display';
import { useStorageDashboard } from '@/features/storage/hooks/use-storage-request';
import { useAppLocale } from '@/hooks/use-app-locale';
import { formatPaise } from '@/lib/currency';
import { formatDate } from '@/lib/format';
import { resolveAppIcon, type IconName } from '@/lib/icon-names';
import type { StorageRequest, StorageSensorMetric } from '@/types/storage';

type StorageDashboardProps = {
  request: StorageRequest;
};

function SensorCard({
  label,
  metric,
  icon,
}: {
  label: string;
  metric?: StorageSensorMetric | null;
  icon: IconName;
}) {
  const hasReading = metric != null && typeof metric.value === 'number';

  return (
    <View className="flex-1 rounded-2xl border border-border bg-white p-3.5">
      <View className="mb-2 flex-row items-center gap-2">
        <AppIcon name={resolveAppIcon(icon)} size={16} color={Palette.indiaGreen} />
        <Text className="text-[12px] font-medium text-muted">{label}</Text>
      </View>
      <Text className="text-[22px] font-bold text-indigo">
        {hasReading ? metric.value : '—'}
        {hasReading && metric.unit ? (
          <Text className="text-[14px] font-semibold text-muted">{metric.unit}</Text>
        ) : null}
      </Text>
    </View>
  );
}

function formatMetric(value: number, unit: string): string {
  return `${value}${unit}`;
}

export function StorageDashboard({ request }: StorageDashboardProps) {
  const { t, locale } = useAppLocale();
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

  const { sensorReadings, forecast24h, location, priceReference, hasSensorData, lastUpdated } =
    dashboard;

  if (!location || !priceReference) {
    return (
      <View className="rounded-2xl border border-border bg-surface px-4 py-5">
        <Text className="text-center text-[14px] text-muted">{t('cropTracker.dashboardError')}</Text>
      </View>
    );
  }

  const showSensorCards = hasSensorData && sensorReadings != null;

  return (
    <View className="gap-4">
      <View className="rounded-2xl border border-border bg-white p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="min-w-0 flex-1">
            <Text className="text-[12px] font-semibold uppercase tracking-wide text-muted">
              {t('cropTracker.liveStatus')}
            </Text>
            <Text className="mt-1 text-[20px] font-bold text-indigo">
              {translateDashboardStatus(t, dashboard.status, dashboard.statusLabel)}
            </Text>
            <Text className="mt-1 text-[13px] text-muted">
              {location.warehouseName} · {location.binId}
            </Text>
          </View>
          <View className="rounded-full bg-india-green/10 px-3 py-1">
            <Text className="text-[12px] font-semibold text-india-green">
              {translateQuantityStored(
                t,
                dashboard.quantityKg,
                dashboard.quantityLabel,
                locale,
              )}
            </Text>
          </View>
        </View>
        <Text className="mt-3 text-[12px] text-muted">
          {lastUpdated
            ? t('cropTracker.lastUpdated', { time: formatDate(lastUpdated) })
            : t('cropTracker.lastUpdatedPending')}
        </Text>
      </View>

      {showSensorCards ? (
        <View className="flex-row gap-3">
          <SensorCard
            label={t('cropTracker.sensors.temperature')}
            metric={sensorReadings.temperature}
            icon="thermometer-outline"
          />
          <SensorCard
            label={t('cropTracker.sensors.humidity')}
            metric={sensorReadings.humidity}
            icon="water-outline"
          />
          <SensorCard
            label={t('cropTracker.sensors.gas')}
            metric={sensorReadings.gas}
            icon="cloud-outline"
          />
        </View>
      ) : (
        <View className="rounded-2xl border border-dashed border-border bg-surface px-4 py-4">
          <Text className="text-center text-[14px] leading-5 text-muted">
            {t('cropTracker.noSensorData')}
          </Text>
        </View>
      )}

      {forecast24h ? (
        <View className="rounded-2xl border border-border bg-white p-4">
          <Text className="text-[14px] font-bold text-indigo">{t('cropTracker.forecast24h')}</Text>
          <View className="mt-3 gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-muted">{t('cropTracker.avgTemperature')}</Text>
              <Text className="text-[13px] font-semibold text-india-green">
                {formatMetric(forecast24h.avgTemperature, t('cropTracker.units.celsius'))}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-muted">{t('cropTracker.avgHumidity')}</Text>
              <Text className="text-[13px] font-semibold text-indigo">
                {formatMetric(forecast24h.avgHumidity, t('cropTracker.units.percent'))}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-muted">{t('cropTracker.avgGas')}</Text>
              <Text className="text-[13px] font-semibold text-indigo">
                {formatMetric(forecast24h.avgGas, t('cropTracker.units.ppm'))}
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-[13px] text-muted">{t('cropTracker.forecastWindow')}</Text>
              <Text className="text-[13px] font-semibold text-indigo">
                {t('cropTracker.forecastWindowValue')}
              </Text>
            </View>
            <Text className="text-[12px] text-muted">
              {t('cropTracker.sampleCount', { count: forecast24h.sampleCount })}
            </Text>
          </View>
        </View>
      ) : null}

      <View className="rounded-2xl border border-dashed border-india-green/40 bg-surface px-4 py-4">
        <Text className="text-[13px] font-semibold text-indigo">{t('cropTracker.valuation')}</Text>
        <Text className="mt-1 text-[18px] font-bold text-india-green">
          {formatPaise(priceReference.amountPaise)}
        </Text>
        <Text className="mt-1 text-[12px] text-muted">
          {translatePriceReferenceLabel(t, priceReference.amountPaise, priceReference.label)}
        </Text>
      </View>
    </View>
  );
}
