import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

export type GridService = {
  key: string;
  title: string;
  badge: string;
  icon: AppIconName;
  iconBg: string;
  iconColor: string;
  badgeColor?: string;
  href?: Href;
};

type ServicesGridProps = {
  services: GridService[];
  t: (key: string) => string;
  useBodyAsBadge?: boolean;
};

export function ServicesGrid({ services, t, useBodyAsBadge = false }: ServicesGridProps) {
  function handlePress(service: GridService) {
    if (service.href) {
      router.push(service.href);
      return;
    }
    Alert.alert(t('home.tools.comingSoon'), t('home.tools.comingSoonBody'));
  }

  return (
    <View className="flex-row flex-wrap" style={{ marginHorizontal: -4 }}>
      {services.map((service) => (
        <View key={service.key} className="p-1" style={{ width: '25%' }}>
          <Pressable
            onPress={() => handlePress(service)}
            className="items-center rounded-2xl bg-white px-1.5 py-3.5"
            style={({ pressed }) => ({
              shadowColor: Palette.indigo,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: pressed ? 0.04 : 0.08,
              shadowRadius: pressed ? 4 : 8,
              elevation: pressed ? 1 : 3,
              minHeight: 116,
              borderWidth: 1,
              borderColor: pressed ? 'rgba(70, 150, 47, 0.25)' : Palette.white,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: service.iconBg }}
            >
              <AppIcon name={service.icon} size={22} color={service.iconColor} />
            </View>
            <Text
              className="mt-2.5 text-center text-[11px] font-semibold leading-4 text-indigo"
              numberOfLines={2}
            >
              {service.title}
            </Text>
            {!useBodyAsBadge ? (
              <Text
                className="mt-1 text-center text-[10px] font-medium"
                style={{ color: service.badgeColor ?? Palette.indiaGreen }}
                numberOfLines={1}
              >
                {service.badge}
              </Text>
            ) : null}
          </Pressable>
        </View>
      ))}
    </View>
  );
}
