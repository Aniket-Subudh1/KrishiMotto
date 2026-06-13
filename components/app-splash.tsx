import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Platform, View } from "react-native";

import { Text } from "@/components/ui/text";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { GradientBand } from "@/components/gradient-band";
import { Fonts, Palette } from "@/constants/theme";

export const SPLASH_DURATION_MS = 3000;

type AppSplashProps = {
  visible: boolean;
};

const HIGHLIGHTS = [
  {
    icon: "calendar-check-outline" as const,
    text: "One-tap crop calendars, treatment & fertiliser plans",
  },
  {
    icon: "robot-outline" as const,
    text: "AI pre-diagnosis before the expert even arrives",
  },
  {
    icon: "satellite-variant" as const,
    text: "Multispectral / hyperspectral → plain-language advice",
  },
  {
    icon: "translate" as const,
    text: "Into the farmer's own language, instantly",
  },
  {
    icon: "handshake-outline" as const,
    text: "Best expert and best loan offer surfaced for you",
  },
  {
    icon: "message-text-outline" as const,
    text: "Ask anything in Hindi, Odia, Telugu, Tamil",
  },
] as const;

const ROTATE_MS = 700;

export function AppSplash({ visible }: AppSplashProps) {
  const progress = useSharedValue(0);
  const fadeIn = useSharedValue(0);
  const taglineOpacity = useSharedValue(1);
  const [highlightIndex, setHighlightIndex] = useState(0);

  useEffect(() => {
    if (!visible) {
      return;
    }

    fadeIn.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });

    progress.value = withTiming(1, {
      duration: SPLASH_DURATION_MS - 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [visible, progress, fadeIn]);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const interval = setInterval(() => {
      taglineOpacity.value = withTiming(0, { duration: 180 });
      setTimeout(() => {
        setHighlightIndex((current) => (current + 1) % HIGHLIGHTS.length);
        taglineOpacity.value = withTiming(1, { duration: 280 });
      }, 180);
    }, ROTATE_MS);

    return () => clearInterval(interval);
  }, [visible, taglineOpacity]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(progress.value * 100, 6)}%`,
  }));

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: (1 - fadeIn.value) * 12 }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  const highlight = HIGHLIGHTS[highlightIndex];

  if (!visible) {
    return null;
  }

  return (
    <View className="absolute inset-0 z-100 bg-background" pointerEvents="none">
      <GradientBand className="absolute top-0 left-0 right-0 h-[5px]" />

      <Animated.View
        className="flex-1 items-center justify-center px-8"
        style={fadeStyle}
      >
        <View className="w-full max-w-[360px] items-center">
          {/* Logo */}
          <View className="mb-5 items-center justify-center">
            <View className="h-[136px] w-[136px] items-center justify-center">
              <View className="absolute h-[136px] w-[136px] rounded-full bg-splash-glow" />
              <View className="absolute h-[116px] w-[116px] rounded-full bg-splash-glow opacity-60" />
              <View
                className="h-[92px] w-[92px] items-center justify-center rounded-full bg-white"
                style={{
                  shadowColor: Palette.indiaGreen,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.18,
                  shadowRadius: 14,
                  elevation: 8,
                }}
              >
                <Image
                  source={require("@/assets/images/logo.png")}
                  style={{ width: 200, height: 200 }}
                  contentFit="contain"
                />
              </View>
            </View>
          </View>

          {/* Title block */}
          <View className="w-full items-center">
            <Text className="text-center text-[36px] font-bold leading-[44px] tracking-[0.4px] text-indigo">
              Krishi Motto
            </Text>
            <View
              className="mt-2 w-full items-center justify-center"
              style={{ minHeight: 52, overflow: "visible" }}
            >
              <Text
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
                style={{
                  fontFamily: Fonts.sansSemibold,
                  fontSize: 26,
                  fontWeight: "600",
                  color: Palette.indiaGreen,
                  textAlign: "center",
                  lineHeight: 48,
                  paddingTop: 4,
                  paddingBottom: 8,
                  width: "100%",
                  ...(Platform.OS === "android"
                    ? { includeFontPadding: false }
                    : {}),
                }}
              >
                {"कृषि\u00A0मोटो"}
              </Text>
            </View>
            <Text className="mt-1 text-center text-[15px] font-normal leading-[22px] text-muted">
              Empowered to Aspire
            </Text>
          </View>

          {/* Gradient divider */}
          <View
            className="my-5 w-full overflow-hidden rounded-full"
            style={{ height: 2 }}
          >
            <LinearGradient
              colors={[Palette.saffron, Palette.indiaGreen]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ flex: 1 }}
            />
          </View>

          {/* Rotating value proposition */}
          <Animated.View
            style={taglineStyle}
            className="min-h-[88px] w-full items-center justify-center rounded-2xl border border-border bg-surface px-5 py-4"
          >
            <View
              className="mb-3 h-11 w-11 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(70, 150, 47, 0.1)" }}
            >
              <MaterialCommunityIcons
                name={highlight.icon}
                size={22}
                color={Palette.indiaGreen}
              />
            </View>
            <Text className="text-center text-[14px] font-medium leading-[21px] text-indigo">
              {highlight.text}
            </Text>
          </Animated.View>

          {/* AI badge */}
          <View
            className="mt-5 flex-row items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5"
            style={{
              shadowColor: Palette.indigo,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 1,
            }}
          >
            <Image
              source={require("@/assets/icons/ai.png")}
              style={{ width: 14, height: 14 }}
              contentFit="contain"
            />
            <Text className="text-[12px] font-semibold tracking-[0.3px] text-indigo">
              Powered by KrishiMotto AI
            </Text>
          </View>
        </View>
      </Animated.View>

      <View className="px-8 pb-10">
        <Text
          className="mb-2 text-center font-condensed-semibold text-[12px] tracking-[0.8px] text-muted"
          style={{ textTransform: "uppercase" }}
        >
          A One-Stop Solution for Farmers
        </Text>
        <View className="mb-1 h-1 overflow-hidden rounded-full bg-border">
          <Animated.View
            className="h-full rounded-full bg-india-green"
            style={progressStyle}
          />
        </View>
        <Text className="mt-2 text-center text-[11px] text-muted opacity-60">
          v1.0 · Made in India 🇮🇳
        </Text>
      </View>

      <GradientBand className="absolute bottom-0 left-0 right-0 h-[5px]" />
    </View>
  );
}
