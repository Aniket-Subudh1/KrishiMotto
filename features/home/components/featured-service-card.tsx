import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { getServiceIconStyle } from '@/features/home/constants/service-icons';
import { SERVICE_ROUTES } from '@/features/home/utils/catalog-display';
import { Palette } from '@/constants/theme';
import {
  translateServiceDescription,
  translateServicePrice,
  translateServiceTitle,
  type TranslateFn,
} from '@/lib/booking-i18n';
import type { CatalogService } from '@/types/catalog';

type FeaturedServiceCardProps = {
  service: CatalogService;
  t: TranslateFn;
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
      className="mr-3 w-[220px] self-start rounded-2xl bg-white"
      style={({ pressed }) => ({
        shadowColor: Palette.indigo,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: pressed ? 0.06 : 0.1,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.8)',
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View className="p-4">
        <View className="flex-row items-start gap-2">
          <View
            className="h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
            style={{ backgroundColor: iconStyle.iconBg }}
          >
            <AppIcon name={iconStyle.icon} size={24} color={iconStyle.iconColor} />
          </View>
          <View
            className="ml-auto shrink self-start"
            style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}
          >
            <Text className="text-right text-[11px] font-bold leading-[15px] text-india-green">
              {translateServicePrice(t, service.iconType, service.priceLabel)}
            </Text>
          </View>
        </View>

        <Text className="mt-4 text-[16px] font-bold leading-[22px] text-indigo">
          {translateServiceTitle(t, service.iconType, service.title)}
        </Text>
        <Text className="mt-1.5 text-[13px] leading-[19px] text-muted">
          {translateServiceDescription(t, service.iconType, service.description)}
        </Text>

        <View className="mt-4 flex-row items-center gap-1.5">
          <Text className="shrink text-[13px] font-semibold leading-[18px] text-india-green">
            {t('home.tools.bookNow')}
          </Text>
          <AppIcon name="arrow-right" size={16} color={Palette.indiaGreen} />
        </View>
      </View>
    </Pressable>
  );
}
