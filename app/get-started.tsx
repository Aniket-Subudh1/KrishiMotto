import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, type Href } from "expo-router";
import { Platform, Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBand } from "@/components/gradient-band";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Palette } from "@/constants/theme";
import { OnboardingCarousel } from "@/features/onboarding/components/onboarding-carousel";
import { useAuthStore } from "@/stores/auth.store";
import { useOnboardingStore } from "@/stores/onboarding.store";

const BOTTOM_FIXED = 142;
const HEADER_H = 80;

export default function GetStartedScreen() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const carouselHeight =
    height - insets.top - insets.bottom - HEADER_H - BOTTOM_FIXED;

  function handleGetStarted() {
    completeOnboarding();
    router.replace("/sign-in" as Href);
  }

  function handleSignIn() {
    completeOnboarding();
    router.replace("/sign-in" as Href);
  }

  return (
    <View className="flex-1 bg-background">
      <GradientBand className="absolute top-0 left-0 right-0 h-[5px]" />
      <GradientBand className="absolute bottom-0 left-0 right-0 h-[5px]" />

      <View style={{ height: insets.top }} />

      <View
        style={{ height: HEADER_H }}
        className="flex-row items-center gap-3 px-5"
      >
        <View className="h-[50px] w-[50px] items-center justify-center">
          <View className="absolute h-[50px] w-[50px] rounded-full bg-splash-glow" />
          <View className="absolute h-[42px] w-[42px] rounded-full bg-splash-glow opacity-75" />
          <View
            className="h-[44px] w-[44px] items-center justify-center rounded-full bg-white"
            style={{
              shadowColor: Palette.indiaGreen,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Image
              source={require("@/assets/images/logo.png")}
              style={{ width: 80, height: 40 }}
              contentFit="contain"
            />
          </View>
        </View>

        <View className="flex-1 gap-0.5">
          <Text className="text-[19px] font-bold leading-[23px] text-indigo">
            Krishi Motto
          </Text>
          <View className="flex-row items-center gap-1.5">
            <LinearGradient
              colors={[Palette.saffron, Palette.indiaGreen]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              className="h-1.5 w-1.5 rounded-full"
            />
            <Text className="text-xs text-muted">Empowered to Aspire</Text>
          </View>
        </View>

        <View className="rounded-full border border-border bg-surface px-2.5 py-1">
          <Text
            className="font-condensed-semibold text-[10px] tracking-[0.2px] text-muted"
            style={
              Platform.OS === "android"
                ? { includeFontPadding: false }
                : undefined
            }
          >
            🇮🇳 Made in India
          </Text>
        </View>
      </View>

      <OnboardingCarousel width={width} height={carouselHeight} />

      {/* Bottom CTA */}
      <View className="px-5 pt-1" style={{ paddingBottom: insets.bottom + 16 }}>
        <View className="mb-1 h-0.5 w-full overflow-hidden rounded-full">
          <LinearGradient
            colors={[Palette.saffron, Palette.indiaGreen]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </View>

        <Button size="lg" className="mt-4 w-full" onPress={handleGetStarted}>
          Get Started
        </Button>

        <Pressable
          onPress={handleSignIn}
          className="flex-row items-center justify-center py-3.5"
        >
          <Text className="text-[15px] text-muted">
            Already have an account?{" "}
          </Text>
          <Text className="text-[15px] font-bold text-primary">Sign In</Text>
        </Pressable>
      </View>
    </View>
  );
}
