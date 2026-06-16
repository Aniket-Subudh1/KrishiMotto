import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import { SERVICE_ROUTES } from '@/features/home/utils/catalog-display';
import { Palette } from '@/constants/theme';
import { translateServiceDescription, translateServicePrice, translateServiceTitle } from '@/lib/booking-i18n';
import type { CatalogService } from '@/types/catalog';

type FeaturedServiceCardProps = {
  service: CatalogService;
  t: (key: string) => string;
};

export function FeaturedServiceCard({ service, t }: FeaturedServiceCardProps) {
  const iconStyle = getServiceIconStyle(service.iconType);
  const href = SERVICE_ROUTES[service.iconType];

  return (
    <Pressable
      onPress={() => {
        if (href) {
          router.push(href);
        }
      }}
      className="mr-3 w-[220px] overflow-hidden rounded-2xl border border-border bg-white"
      style={{
        shadowColor: Palette.indigo,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
      }}
    >
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: iconStyle.iconBg }}
          >
            <Ionicons name={iconStyle.icon} size={22} color={iconStyle.iconColor} />
          </View>
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
          >
            <Text className="text-[11px] font-bold text-india-green">
              {translateServicePrice(t, service.iconType, service.priceLabel)}
            </Text>
          </View>
        </View>

        <Text className="mt-4 text-[16px] font-bold text-indigo" numberOfLines={1}>
          {translateServiceTitle(t, service.iconType, service.title)}
        </Text>
        <Text className="mt-1.5 text-[13px] leading-5 text-muted" numberOfLines={2}>
          {translateServiceDescription(t, service.iconType, service.description)}
        </Text>

        <View className="mt-4 flex-row items-center gap-1">
          <Text className="text-[13px] font-semibold text-india-green">
            {t('home.tools.bookNow')}
          </Text>
          <Ionicons name="arrow-forward" size={14} color={Palette.indiaGreen} />
        </View>
      </View>
    </Pressable>
  );
}
