import "@/lib/i18n";
import "../global.css";

import { ThemeProvider } from "@react-navigation/native";
import { QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import Animated, { FadeOut } from "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppSplash, SPLASH_DURATION_MS } from "@/components/app-splash";
import { FontLoadMap } from "@/constants/fonts";
import { Colors, Fonts, NavigationTheme } from "@/constants/theme";
import { queryClient } from "@/lib/query-client";
import { AuthSessionProvider } from "@/providers/auth-session-provider";
import { I18nProvider } from "@/providers/i18n-provider";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go does not support native splash customization.
});

export default function RootLayout() {
  "use no memo";
  const [fontsLoaded, fontError] = useFonts(FontLoadMap);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    if (!fontsLoaded && !fontError) {
      return;
    }

    SplashScreen.hideAsync().catch(() => {
      // Native splash is unavailable in Expo Go.
    });

    const timer = setTimeout(() => setSplashDone(true), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 bg-background font-sans">
        <AppSplash visible />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider
        navigationBarTranslucent
        statusBarTranslucent
        preload={false}
      >
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthSessionProvider>
              <I18nProvider>
                <View className="flex-1 bg-background font-sans">
                  <ThemeProvider value={NavigationTheme}>
                    <Stack
                      screenOptions={{
                        contentStyle: { backgroundColor: Colors.background },
                        headerTitleStyle: {
                          fontFamily: Fonts.sansSemibold,
                          fontWeight: "600",
                        },
                      }}
                    >
                      <Stack.Screen
                        name="index"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="get-started"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="select-role"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="sign-in"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="farmer"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="expert"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="(tabs)"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="services"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="payment"
                        options={{ headerShown: false }}
                      />
                      <Stack.Screen
                        name="modal"
                        options={{ presentation: "modal", title: "Modal" }}
                      />
                    </Stack>
                    <StatusBar style="dark" translucent />
                  </ThemeProvider>

                  {!splashDone && (
                    <Animated.View
                      exiting={FadeOut.duration(500)}
                      className="absolute inset-0 z-100"
                    >
                      <AppSplash visible />
                    </Animated.View>
                  )}
                </View>
              </I18nProvider>
            </AuthSessionProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
