import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, router, useLocalSearchParams, type Href } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GradientBand } from "@/components/gradient-band";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { FittedText } from "@/components/ui/fitted-text";
import { Text } from "@/components/ui/text";
import { SELECTABLE_ROLES, type SelectableRole } from "@/constants/roles";
import { Palette } from "@/constants/theme";
import { useAppLocale } from "@/hooks/use-app-locale";
import { useAuthFlowStore, type AuthIntent } from "@/stores/auth-flow.store";
import { useAuthStore } from "@/stores/auth.store";

function isAuthIntent(
  value: string | string[] | undefined,
): value is AuthIntent {
  return value === "register" || value === "sign-in";
}

export default function SelectRoleScreen() {
  const { t } = useAppLocale();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ intent?: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasEnteredFromGetStarted = useAuthFlowStore(
    (s) => s.hasEnteredFromGetStarted,
  );
  const setAuthFlow = useAuthFlowStore((s) => s.setAuthFlow);

  const intent = isAuthIntent(params.intent) ? params.intent : null;
  const [selectedRole, setSelectedRole] = useState<SelectableRole | null>(null);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  if (!hasEnteredFromGetStarted || !intent) {
    return <Redirect href={"/get-started" as Href} />;
  }

  const isRegister = intent === "register";

  function handleContinue() {
    if (!selectedRole || !intent) {
      return;
    }

    setAuthFlow(intent, selectedRole);

    if (selectedRole === "farmer" && intent === "register") {
      router.push("/farmer/sign-up" as Href);
      return;
    }

    if (selectedRole === "farmer" && intent === "sign-in") {
      router.push("/farmer/sign-in" as Href);
      return;
    }

    if (selectedRole === "expert" && intent === "register") {
      router.push("/expert/sign-up" as Href);
      return;
    }

    if (selectedRole === "expert" && intent === "sign-in") {
      router.push("/expert/sign-in" as Href);
      return;
    }

    router.push("/sign-in" as Href);
  }

  return (
    <View className="flex-1 bg-background">
      <GradientBand className="absolute top-0 left-0 right-0 h-[5px]" />
      <GradientBand className="absolute bottom-0 left-0 right-0 h-[5px]" />

      <View style={{ height: insets.top }} />

      <View className="flex-row items-center justify-between px-5 py-2">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-surface"
          accessibilityRole="button"
          accessibilityLabel={t("selectRole.back")}
        >
          <Ionicons name="chevron-back" size={20} color={Palette.indigo} />
        </Pressable>

        <LanguageSelector />
      </View>

      <View className="flex-1 px-5 pt-2">
        <View className="mb-6 items-center">
          <View className="h-[72px] w-[72px] items-center justify-center">
            <View className="absolute h-[72px] w-[72px] rounded-full bg-splash-glow" />
            <View
              className="h-[60px] w-[60px] items-center justify-center rounded-full bg-white"
              style={{
                shadowColor: Palette.indiaGreen,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 4,
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

        <FittedText
          fit
          maxLines={2}
          minScale={0.8}
          className="text-center text-[28px] font-bold leading-8 text-indigo"
        >
          {isRegister
            ? t("selectRole.registerTitle")
            : t("selectRole.signInTitle")}
        </FittedText>

        <FittedText
          shrink
          maxLines={3}
          className="mt-2 text-center text-[15px] leading-[22px] text-muted"
        >
          {isRegister
            ? t("selectRole.registerSubtitle")
            : t("selectRole.signInSubtitle")}
        </FittedText>

        <View className="mt-7 h-0.5 w-full overflow-hidden rounded-full">
          <LinearGradient
            colors={[Palette.saffron, Palette.indiaGreen]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </View>

        <View className="mt-6 gap-3">
          {SELECTABLE_ROLES.map((role) => {
            const selected = selectedRole === role.id;

            return (
              <Pressable
                key={role.id}
                onPress={() => setSelectedRole(role.id)}
                className={`flex-row items-center gap-3.5 rounded-2xl border px-4 py-4 ${
                  selected
                    ? "border-india-green bg-surface"
                    : "border-border bg-background"
                }`}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
              >
                <View
                  className="h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: role.accentBg }}
                >
                  <Ionicons
                    name={role.icon}
                    size={24}
                    color={role.accentColor}
                  />
                </View>

                <View className="min-w-0 flex-1">
                  <FittedText
                    shrink
                    maxLines={1}
                    className="text-[17px] font-semibold text-indigo"
                  >
                    {t(`selectRole.${role.id}.title`)}
                  </FittedText>
                  <FittedText
                    shrink
                    maxLines={3}
                    className="mt-0.5 text-[13px] leading-[18px] text-muted"
                  >
                    {t(`selectRole.${role.id}.description`)}
                  </FittedText>
                </View>

                {selected ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={Palette.indiaGreen}
                  />
                ) : (
                  <View className="h-6 w-6 shrink-0 rounded-full border-2 border-border" />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="px-5 pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
        <Button
          size="lg"
          className="w-full"
          disabled={!selectedRole}
          onPress={handleContinue}
        >
          {isRegister
            ? t("selectRole.continueRegister")
            : t("selectRole.continueSignIn")}
        </Button>

        <Text className="mt-3 text-center text-[12px] leading-[18px] text-muted">
          {t("selectRole.hint")}
        </Text>
      </View>
    </View>
  );
}
