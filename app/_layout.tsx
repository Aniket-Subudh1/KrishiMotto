import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';
import 'react-native-reanimated';

import { AppSplash } from '@/components/app-splash';
import { Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Expo Go does not support native splash customization.
});

const KrishiLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.indiaGreen,
    background: Palette.paper,
    card: Palette.paper,
    text: Palette.indigo,
    border: '#E2E8F0',
  },
};

const KrishiDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: Palette.marigold,
    background: Palette.indigo,
    card: Palette.indigo,
    text: Palette.paper,
    border: '#2D3748',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Native splash is unavailable in Expo Go.
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

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
    <View style={styles.root}>
      <ThemeProvider value={colorScheme === 'dark' ? KrishiDarkTheme : KrishiLightTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>

      {!splashDone && (
        <Animated.View exiting={FadeOut.duration(500)} style={styles.splashLayer}>
          <AppSplash visible />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  splashLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
});
