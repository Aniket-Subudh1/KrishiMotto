import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import { Alert, Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

export type GridService = {
  key: string;
  title: string;
  badge: string;
  icon: keyof typeof Ionicons.glyphMap;
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
    <View className="flex-row flex-wrap">
      {services.map((service) => (
        <View key={service.key} className="p-1" style={{ width: '25%' }}>
          <Pressable
            onPress={() => handlePress(service)}
            className="items-center rounded-2xl border border-border bg-white px-1 py-3"
            style={{
              shadowColor: Palette.indigo,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 4,
              elevation: 2,
              minHeight: 108,
            }}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: service.iconBg }}
            >
              <Ionicons name={service.icon} size={20} color={service.iconColor} />
            </View>
            <Text
              className="mt-2 text-center text-[11px] font-semibold leading-4 text-indigo"
              numberOfLines={2}
            >
              {service.title}
            </Text>
            {!useBodyAsBadge ? (
              <Text
                className="mt-1 text-center text-[10px] font-medium"
                style={{ color: service.badgeColor ?? Palette.indigo }}
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
