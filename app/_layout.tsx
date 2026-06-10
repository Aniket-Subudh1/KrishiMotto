import '../global.css';
import '@/lib/i18n';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppSplash, SPLASH_DURATION_MS } from '@/components/app-splash';
import { FontLoadMap } from '@/constants/fonts';
import { Colors, Fonts, NavigationTheme } from '@/constants/theme';
import { queryClient } from '@/lib/query-client';
import { I18nProvider } from '@/providers/i18n-provider';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go does not support native splash customization.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FontLoadMap);
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      if (!fontsLoaded && !fontError) {
        return;
      }

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
      <QueryClientProvider client={queryClient}>
        <I18nProvider>
          <View className="flex-1 bg-background font-sans">
          <ThemeProvider value={NavigationTheme}>
            <Stack
              screenOptions={{
                contentStyle: { backgroundColor: Colors.background },
                headerTitleStyle: {
                  fontFamily: Fonts.sansSemibold,
                  fontWeight: '600',
                },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="get-started" options={{ headerShown: false }} />
              <Stack.Screen name="select-role" options={{ headerShown: false }} />
              <Stack.Screen name="farmer" options={{ headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="modal"
                options={{ presentation: 'modal', title: 'Modal' }}
              />
            </Stack>
            <StatusBar style="dark" />
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
    </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
