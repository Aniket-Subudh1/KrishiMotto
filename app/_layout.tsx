import '../global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';
import Animated, { FadeOut } from 'react-native-reanimated';

import { AppSplash, SPLASH_DURATION_MS } from '@/components/app-splash';
import { FontLoadMap } from '@/constants/fonts';
import { Colors, Fonts, NavigationTheme } from '@/constants/theme';
import { queryClient } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go does not support native splash customization.
});

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(FontLoadMap);
  const [splashDone, setSplashDone] = useState(false);
  const setHydrated = useAppStore((s) => s.setHydrated);

  // Mark stores as hydrated once zustand-persist has rehydrated from AsyncStorage
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });

    // If already hydrated (synchronous storage) resolve immediately
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }

    return unsub;
  }, [setHydrated]);

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
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
