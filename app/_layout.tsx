import "../global.css";

import { ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import "react-native-reanimated";
import Animated, { FadeOut } from "react-native-reanimated";

import { AppSplash, SPLASH_DURATION_MS } from "@/components/app-splash";
import { Colors, NavigationTheme } from "@/constants/theme";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go does not support native splash customization.
});

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Native splash is unavailable in Expo Go.
      }

      await new Promise((resolve) => setTimeout(resolve, SPLASH_DURATION_MS));

      if (!cancelled) {
        setSplashDone(true);
      }
    }

    prepare();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View className="flex-1 bg-background">
      <ThemeProvider value={NavigationTheme}>
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: Colors.background },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal"
            options={{ presentation: "modal", title: "Modal" }}
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>

      {!splashDone && (
        <Animated.View
          exiting={FadeOut.duration(500)}
          className="absolute inset-0 z-[100]"
        >
          <AppSplash visible />
        </Animated.View>
      )}
    </View>
  );
}
