import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router, type Href } from "expo-router";
import { useEffect } from "react";
import { Pressable, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBand } from "@/components/gradient-band";
import { LanguageSelector } from "@/components/language-selector";
import { AuthRedirect } from "@/components/auth/auth-redirect";
import { Button } from "@/components/ui/button";
import { FittedText } from "@/components/ui/fitted-text";
import { Text } from "@/components/ui/text";
import { Palette } from "@/constants/theme";
import { OnboardingCarousel } from "@/features/onboarding/components/onboarding-carousel";
import { useAppLocale } from "@/hooks/use-app-locale";
import { useAuthFlowStore } from "@/stores/auth-flow.store";
import { useAuthStore } from "@/stores/auth.store";

const BOTTOM_FIXED = 156;
const HEADER_H = 88;

export default function GetStartedScreen() {
  const { t } = useAppLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const clearAuthFlow = useAuthFlowStore((s) => s.clearAuthFlow);
  const markEnteredFromGetStarted = useAuthFlowStore(
    (s) => s.markEnteredFromGetStarted,
  );
  const setAuthIntent = useAuthFlowStore((s) => s.setAuthIntent);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isAuthenticated) {
      clearAuthFlow();
    }
  }, [clearAuthFlow, isAuthenticated]);

  if (isAuthenticated) {
    return <AuthRedirect />;
  }

  const carouselHeight =
    height - insets.top - insets.bottom - HEADER_H - BOTTOM_FIXED;

  function handleGetStarted() {
    markEnteredFromGetStarted();
    router.push("/select-role?intent=register" as Href);
  }

  function handleSignIn() {
    markEnteredFromGetStarted();
    setAuthIntent('sign-in');
    router.push('/sign-in' as Href);
  }

  return (
    <View className="flex-1 bg-background">
      <GradientBand className="absolute top-0 left-0 right-0 h-[5px]" />
      <GradientBand className="absolute bottom-0 left-0 right-0 h-[5px]" />

      <View style={{ height: insets.top }} />

      <View
        style={{ minHeight: HEADER_H }}
        className="flex-row items-center gap-2.5 px-5 py-1.5"
      >
        <View className="h-[50px] w-[50px] shrink-0 items-center justify-center">
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
              style={{ width: 200, height: 70 }}
              contentFit="contain"
            />
          </View>
        </View>

        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-[19px] font-bold leading-[23px] text-indigo">
            Krishi Motto
          </Text>
          <View className="min-w-0 flex-row items-center gap-1.5">
            <LinearGradient
              colors={[Palette.saffron, Palette.indiaGreen]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              className="h-1.5 w-1.5 shrink-0 rounded-full"
            />
            <FittedText
              shrink
              fit
              maxLines={2}
              minScale={0.8}
              className="flex-1 text-[11px] leading-[14px] text-muted"
            >
              {t("getStarted.tagline")}
            </FittedText>
          </View>
        </View>

        <LanguageSelector />
      </View>

      <OnboardingCarousel width={width} height={carouselHeight} />

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
          {t("getStarted.cta")}
        </Button>

        <Pressable onPress={handleSignIn} className="items-center px-1 py-3.5">
          <Text className="text-center text-[15px] leading-[22px] text-muted">
            {t("getStarted.alreadyHaveAccount")}{" "}
            <Text className="font-bold text-primary">
              {t("getStarted.signIn")}
            </Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
