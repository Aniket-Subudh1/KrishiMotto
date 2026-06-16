import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

const TAB_ICONS: Record<string, { icon: AppIconName; iconFocused: AppIconName }> = {
  index: { icon: 'home-variant-outline', iconFocused: 'home-variant' },
  land: { icon: 'map-marker-radius-outline', iconFocused: 'map-marker-radius' },
  explore: { icon: 'view-grid-outline', iconFocused: 'view-grid' },
  profile: { icon: 'account-circle-outline', iconFocused: 'account-circle' },
};

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white"
      style={{
        shadowColor: Palette.indigo,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 12,
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

      <View className="h-[56px] flex-row items-stretch px-1" style={{ paddingBottom: 0 }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS.index;
          const label = options.title ?? route.name;
          const color = isFocused ? Palette.indiaGreen : '#94A3B8';

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          }

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              className="flex-1 items-center justify-center"
            >
              <View className="items-center justify-center gap-1">
                <View
                  className="h-8 w-11 items-center justify-center rounded-2xl"
                  style={isFocused ? { backgroundColor: 'rgba(70, 150, 47, 0.12)' } : undefined}
                >
                  <AppIcon
                    name={isFocused ? icons.iconFocused : icons.icon}
                    size={22}
                    color={color}
                  />
                </View>
                <Text
                  className="text-[10px] font-condensed-semibold"
                  style={{ color, fontWeight: isFocused ? '700' : '500' }}
                >
                  {label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: insets.bottom }} />
    </View>
  );
}
