import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

const TAB_ICONS: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; iconFocused: keyof typeof Ionicons.glyphMap }
> = {
  index: { icon: 'home-outline', iconFocused: 'home' },
  land: { icon: 'map-outline', iconFocused: 'map' },
  explore: { icon: 'grid-outline', iconFocused: 'grid' },
  profile: { icon: 'person-outline', iconFocused: 'person' },
};

export function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="bg-white"
      style={{
        shadowColor: Palette.indigo,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 8,
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

      <View className="h-[52px] flex-row items-stretch px-1" style={{ paddingBottom: 0 }}>
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
              <View className="items-center justify-center gap-0.5">
                <View
                  className="h-7 w-10 items-center justify-center rounded-full"
                  style={isFocused ? { backgroundColor: 'rgba(70, 150, 47, 0.1)' } : undefined}
                >
                  <Ionicons
                    name={isFocused ? icons.iconFocused : icons.icon}
                    size={20}
                    color={color}
                  />
                </View>
                <Text className="text-[10px] font-condensed-semibold" style={{ color }}>
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
