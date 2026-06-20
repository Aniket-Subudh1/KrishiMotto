import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon, type AppIconName } from "@/components/ui/app-icon";
import { FittedText } from "@/components/ui/fitted-text";
import { Palette } from "@/constants/theme";
import { useAuthStore } from "@/stores/auth.store";

const TAB_ICONS: Record<
  string,
  { icon: AppIconName; iconFocused: AppIconName }
> = {
  index: { icon: "home-variant-outline", iconFocused: "home-variant" },
  requests: {
    icon: "briefcase-search-outline",
    iconFocused: "briefcase-search",
  },
  orders: { icon: "clipboard-list-outline", iconFocused: "clipboard-list" },
  land: { icon: "map-marker-radius-outline", iconFocused: "map-marker-radius" },
  explore: { icon: "view-grid-outline", iconFocused: "view-grid" },
  profile: { icon: "account-circle-outline", iconFocused: "account-circle" },
};

function getVisibleTabNames(role: string | undefined): string[] {
  if (role === "EXPERT") {
    return ["index", "requests", "orders", "profile"];
  }

  if (role === "FARMER") {
    return ["index", "land", "explore", "profile"];
  }

  return ["index", "profile"];
}

function isTabVisible(
  routeName: string,
  options: BottomTabBarProps["descriptors"][string]["options"],
  allowedTabNames: string[],
) {
  if (!allowedTabNames.includes(routeName)) {
    return false;
  }

  if ("href" in options && options.href === null) {
    return false;
  }

  return options.tabBarButton !== null;
}

export function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const role = useAuthStore((s) => s.user?.role);
  const allowedTabNames = useMemo(() => getVisibleTabNames(role), [role]);
  const visibleRoutes = state.routes.filter((route) =>
    isTabVisible(route.name, descriptors[route.key].options, allowedTabNames),
  );

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

      <View
        className="min-h-[60px] flex-row items-stretch px-1 py-1"
        style={{ paddingBottom: 0 }}
      >
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const routeIndex = state.routes.findIndex((item) => item.key === route.key);
          const isFocused = state.index === routeIndex;
          const icons = TAB_ICONS[route.name] ?? TAB_ICONS.index;
          const label = options.title ?? route.name;
          const color = isFocused ? Palette.indiaGreen : "#94A3B8";

          function onPress() {
            const event = navigation.emit({
              type: "tabPress",
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
              className="flex-1 items-center justify-center px-0.5 py-1.5"
            >
              <View className="w-full items-center justify-center gap-0.5">
                <View
                  className="h-8 w-11 items-center justify-center rounded-2xl"
                  style={
                    isFocused
                      ? { backgroundColor: "rgba(70, 150, 47, 0.12)" }
                      : undefined
                  }
                >
                  <AppIcon
                    name={isFocused ? icons.iconFocused : icons.icon}
                    size={22}
                    color={color}
                  />
                </View>
                <FittedText
                  maxLines={2}
                  className="w-full text-center text-[10px] font-condensed-semibold leading-3"
                  style={{ color, fontWeight: isFocused ? "700" : "500" }}
                >
                  {label}
                </FittedText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: insets.bottom }} />
    </View>
  );
}
