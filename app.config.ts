import type { ConfigContext, ExpoConfig } from 'expo/config';

const APP_NAME = 'KrishiMotto';
const APP_SLUG = 'KrishiMotto';
const APP_VERSION = '1.0.0';

/** Tricolour-inspired palette */
const Palette = {
  saffron: '#F4A460',
  indiaGreen: '#46962F',
  indigo: '#1A365D',
  marigold: '#E9AF43',
  paper: '#F5F5F5',
} as const;

const APP_ICON = './assets/images/icon.png';
const ANDROID_ADAPTIVE_ICON = {
  foregroundImage: './assets/images/android-icon-foreground.png',
  backgroundImage: './assets/images/android-icon-background.png',
  monochromeImage: './assets/images/android-icon-monochrome.png',
  backgroundColor: Palette.paper,
} as const;

const IOS_BUILD_NUMBER = '1';
const ANDROID_VERSION_CODE = 1;

const BACKEND_HOST = process.env.EXPO_PUBLIC_API_HOST ?? 'localhost';
const BACKEND_PORT = Number(process.env.EXPO_PUBLIC_API_PORT ?? '5000');
const API_URL = `http://${BACKEND_HOST}:${BACKEND_PORT}`;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: APP_SLUG,
  version: APP_VERSION,
  orientation: 'portrait',
  icon: APP_ICON,
  scheme: 'krishimotto',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  backgroundColor: Palette.paper,
  ios: {
    ...config.ios,
    supportsTablet: true,
    buildNumber: IOS_BUILD_NUMBER,
  },
  android: {
    ...config.android,
    versionCode: ANDROID_VERSION_CODE,
    adaptiveIcon: ANDROID_ADAPTIVE_ICON,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    ...config.web,
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: Palette.paper,
        image: './assets/images/logo.png',
        imageWidth: 280,
        resizeMode: 'contain',
        dark: {
          backgroundColor: Palette.indigo,
          image: './assets/images/logo.png',
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...config.extra,
    apiUrl: API_URL,
    apiHost: BACKEND_HOST,
    apiPort: BACKEND_PORT,
  },
});
