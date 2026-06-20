import { router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { RequestedServiceListItem } from '@/features/home/components/requested-service-card';
import { useRequestedServices } from '@/features/home/hooks/use-requested-services';
import { REQUESTED_SERVICES_PREVIEW_LIMIT } from '@/features/home/utils/requested-services';
import { Palette } from '@/constants/theme';

type RequestedServicesSectionProps = {
  t: (key: string) => string;
  locale: string;
};

export function RequestedServicesSection({ t, locale }: RequestedServicesSectionProps) {
  const { items, isLoading } = useRequestedServices();
  const previewItems = items.slice(0, REQUESTED_SERVICES_PREVIEW_LIMIT);
  const showViewAll = items.length > REQUESTED_SERVICES_PREVIEW_LIMIT;

  if (isLoading) {
    return (
      <View className="mt-7 px-5">
        <SectionHeader t={t} totalCount={0} showViewAll={false} />
        <View className="items-center py-6">
          <ActivityIndicator size="small" color={Palette.indiaGreen} />
        </View>
      </View>
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <View className="mt-7 px-5">
      <SectionHeader t={t} totalCount={items.length} showViewAll={showViewAll} />
      <View className="gap-3">
        {previewItems.map((item) => (
          <RequestedServiceListItem
            key={
              item.kind === 'booking'
                ? `booking-${item.booking.id}`
                : item.kind === 'loan'
                  ? `loan-${item.loan.id}`
                  : `storage-${item.request.id}`
            }
            item={item}
            t={t}
            locale={locale}
          />
        ))}
      </View>
    </View>
  );
}

function SectionHeader({
  t,
  totalCount,
  showViewAll,
}: {
  t: (key: string) => string;
  totalCount: number;
  showViewAll: boolean;
}) {
  return (
    <View className="mb-4 flex-row items-center gap-2.5">
      <View
        className="h-8 w-8 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'rgba(26, 54, 93, 0.08)' }}
      >
        <AppIcon name="clipboard-text-clock-outline" size={18} color={Palette.indigo} />
      </View>
      <FittedText shrink maxLines={2} className="min-w-0 flex-1 text-[18px] font-bold leading-6 text-indigo">
        {t('home.dashboard.requestedServicesTitle')}
      </FittedText>
      {showViewAll ? (
        <Pressable
          onPress={() => router.push('/requested-services')}
          className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
        >
          <Text className="text-[13px] font-semibold text-india-green">
            {t('home.overview.viewAll')}
          </Text>
          <AppIcon name="arrow-right" size={14} color={Palette.indiaGreen} />
        </Pressable>
      ) : totalCount > 0 ? (
        <View
          className="min-w-[26px] items-center justify-center rounded-full px-2 py-0.5"
          style={{ backgroundColor: 'rgba(70, 150, 47, 0.12)' }}
        >
          <Text className="text-[12px] font-bold text-india-green">{totalCount}</Text>
        </View>
      ) : null}
    </View>
  );
}
