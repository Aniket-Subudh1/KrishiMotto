import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, Palette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type AppSplashProps = {
  visible: boolean;
};

export function AppSplash({ visible }: AppSplashProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  if (!visible) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? Palette.indigo : Palette.paper },
      ]}
      pointerEvents="none">
      <View style={styles.topBand}>
        <View style={[styles.bandHalf, { backgroundColor: Palette.saffron }]} />
        <View style={[styles.bandHalf, { backgroundColor: Palette.indiaGreen }]} />
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.glow,
            { backgroundColor: isDark ? 'rgba(233, 175, 67, 0.12)' : 'rgba(244, 164, 96, 0.18)' },
          ]}
        />
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={[styles.title, { color: colors.text }]}>KrishiMotto</Text>
        <Text style={[styles.subtitle, { color: isDark ? Palette.marigold : Palette.indiaGreen }]}>
          Your land, your data
        </Text>
        <View style={styles.dots}>
          <View style={[styles.dot, { backgroundColor: Palette.saffron }]} />
          <View style={[styles.dot, { backgroundColor: Palette.marigold }]} />
          <View style={[styles.dot, { backgroundColor: Palette.indiaGreen }]} />
        </View>
      </View>

      <View style={styles.bottomBand}>
        <View style={[styles.bandHalf, { backgroundColor: Palette.saffron }]} />
        <View style={[styles.bandHalf, { backgroundColor: Palette.indiaGreen }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  topBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
  },
  bottomBand: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    flexDirection: 'row',
  },
  bandHalf: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  glow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: '28%',
  },
  logo: {
    width: 280,
    height: 186,
    marginBottom: 28,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 28,
  },
  dots: {
    flexDirection: 'row',
    gap: 10,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
  },
});
