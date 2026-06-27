import type { ConfigContext, ExpoConfig } from "expo/config";

const APP_NAME = "KrishiMotto";
const APP_SLUG = "KrishiMotto";
const APP_VERSION = "1.0.0";

const Palette = {
  saffron: "#F4A460",
  indiaGreen: "#46962F",
  indigo: "#1A365D",
  marigold: "#E9AF43",
  paper: "#F5F5F5",
  white: "#FFFFFF",
} as const;

const APP_ICON = "./assets/images/icon.png";
const SPLASH_IMAGE = "./assets/images/splash-icon.png";
const ANDROID_ADAPTIVE_ICON = {
  foregroundImage: APP_ICON,
  backgroundColor: Palette.paper,
} as const;

const IOS_BUILD_NUMBER = "1";

const API_URL = "https://krishiaadhar.gramtarang.org";
const ASSET_S3_BUCKET = "gttech-assests";
const ASSET_S3_REGION = "ap-south-1";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: APP_SLUG,
  version: APP_VERSION,
  orientation: "portrait",
  icon: APP_ICON,
  scheme: "krishimotto",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  backgroundColor: Palette.white,
  ios: {
    ...config.ios,
    supportsTablet: true,
    buildNumber: IOS_BUILD_NUMBER,
  },
  android: {
    ...config.android,
    package: "com.krishimottto.app",
    adaptiveIcon: ANDROID_ADAPTIVE_ICON,
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: "resize",
  },
  web: {
    ...config.web,
    bundler: "metro",
    output: "static",
    favicon: APP_ICON,
  },
  plugins: [
    "expo-router",
    "expo-localization",
    [
      "expo-web-browser",
      {
        experimentalLauncherActivity: true,
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "KrishiMotto needs access to your photos to set a profile picture.",
      },
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "KrishiMotto needs your location to centre the map on your field.",
        locationAlwaysAndWhenInUsePermission:
          "KrishiMotto needs your location to centre the map on your field.",
      },
    ],
    [
      "expo-speech-recognition",
      {
        microphonePermission:
          "KrishiMotto needs microphone access so you can ask KrishiAI by voice.",
        speechRecognitionPermission:
          "KrishiMotto uses speech recognition to turn your voice into text for KrishiAI.",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: Palette.white,
        image: SPLASH_IMAGE,
        imageWidth: 200,
        resizeMode: "contain",
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    ...config.extra,
    eas: {
      projectId: "000b27c8-ab72-4bf2-83f4-62761d0232db",
    },
    apiUrl: API_URL,
    assetS3Bucket: ASSET_S3_BUCKET,
    assetS3Region: ASSET_S3_REGION,
  },
});
