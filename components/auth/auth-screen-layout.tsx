import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
  type ScrollViewProps,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  AuthScrollContext,
  useRegisterScrollField,
} from "@/components/auth/auth-scroll-context";
import { GradientBand } from "@/components/gradient-band";
import { LanguageSelector } from "@/components/language-selector";
import { FittedText } from "@/components/ui/fitted-text";
import { Text } from "@/components/ui/text";
import { Palette } from "@/constants/theme";

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: string;
  currentStep?: number;
  totalSteps?: number;
  stepLabels?: string[];
  onBack?: () => void;
  showBackButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  footerHint?: string;
  scrollProps?: ScrollViewProps;
};

const FOOTER_HEIGHT = 108;
const KEYBOARD_SCROLL_PADDING = 20;

export function AuthScreenLayout({
  title,
  subtitle,
  currentStep,
  totalSteps = 3,
  stepLabels,
  onBack,
  showBackButton = true,
  children,
  footer,
  footerHint,
  scrollProps,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const contentRef = useRef<View>(null);
  const scrollY = useRef(0);
  const activeFieldRef = useRef<RefObject<View | null> | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const scrollToFieldRef = useCallback(
    (fieldRef: RefObject<View | null>) => {
      if (!fieldRef.current || !scrollRef.current) {
        return;
      }

      const effectiveKeyboardHeight =
        keyboardHeight > 0
          ? keyboardHeight
          : Platform.OS === "ios"
            ? 320
            : 280;

      fieldRef.current.measureInWindow((_x, y, _width, height) => {
        const windowHeight = Dimensions.get("window").height;
        const keyboardTop = windowHeight - effectiveKeyboardHeight;
        const safeBottom =
          keyboardTop - FOOTER_HEIGHT - insets.bottom - KEYBOARD_SCROLL_PADDING;
        const fieldBottom = y + height;
        const overlap = fieldBottom - safeBottom;

        if (overlap > 0) {
          scrollRef.current?.scrollTo({
            y: Math.max(0, scrollY.current + overlap),
            animated: true,
          });
        }
      });
    },
    [insets.bottom, keyboardHeight],
  );

  const setActiveField = useCallback((id: string | null) => {
    if (!id) {
      activeFieldRef.current = null;
    }
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (keyboardHeight <= 0 || !activeFieldRef.current) {
      return;
    }

    const timer = setTimeout(
      () => {
        if (activeFieldRef.current) {
          scrollToFieldRef(activeFieldRef.current);
        }
      },
      Platform.OS === "ios" ? 50 : 100,
    );

    return () => clearTimeout(timer);
  }, [keyboardHeight, scrollToFieldRef]);

  const scrollContextValue = useMemo(
    () => ({
      contentRef,
      setActiveField: (id: string | null) => {
        setActiveField(id);
      },
      scrollToFieldRef: (fieldRef: RefObject<View | null>) => {
        activeFieldRef.current = fieldRef;
        scrollToFieldRef(fieldRef);
      },
    }),
    [scrollToFieldRef, setActiveField],
  );

  const scrollBottomPadding =
    keyboardHeight > 0
      ? keyboardHeight + FOOTER_HEIGHT + KEYBOARD_SCROLL_PADDING
      : 24;

  return (
    <AuthScrollContext.Provider value={scrollContextValue}>
      <View className="flex-1 bg-background">
        <GradientBand className="absolute top-0 left-0 right-0 h-[5px]" />
        <GradientBand className="absolute bottom-0 left-0 right-0 h-[5px]" />

        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 8 : 0}
        >
          <View style={{ height: insets.top }} />

          <View className="flex-row items-center justify-between px-5 py-2">
            {showBackButton ? (
              <Pressable
                onPress={onBack ?? (() => router.back())}
                className="h-10 w-10 items-center justify-center rounded-full bg-surface"
                accessibilityRole="button"
              >
                <Ionicons name="chevron-back" size={20} color={Palette.indigo} />
              </Pressable>
            ) : (
              <View className="h-10 w-10" />
            )}
            <LanguageSelector />
          </View>

          <ScrollView
            ref={scrollRef}
            className="flex-1 px-5"
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
            onScroll={(event) => {
              scrollY.current = event.nativeEvent.contentOffset.y;
            }}
            scrollEventThrottle={16}
            {...scrollProps}
          >
            <View className="mb-4 items-center">
              <View className="h-[64px] w-[64px] items-center justify-center">
                <View className="absolute h-[64px] w-[64px] rounded-full bg-splash-glow" />
                <View className="h-[52px] w-[52px] items-center justify-center rounded-full bg-white">
                  <Image
                    source={require("@/assets/images/logo.png")}
                    style={{ width: 200, height: 100 }}
                    contentFit="contain"
                  />
                </View>
              </View>
            </View>

            {currentStep ? (
              <SignupStepIndicator
                current={currentStep}
                total={totalSteps}
                labels={stepLabels}
              />
            ) : null}

            <FittedText
              fit
              maxLines={2}
              minScale={0.8}
              className="text-center text-[26px] font-bold leading-8 text-indigo"
            >
              {title}
            </FittedText>

            {subtitle ? (
              <FittedText
                shrink
                maxLines={3}
                className="mt-2 text-center text-[15px] leading-[22px] text-muted"
              >
                {subtitle}
              </FittedText>
            ) : null}

            <View className="my-5 h-0.5 w-full overflow-hidden rounded-full">
              <LinearGradient
                colors={[Palette.saffron, Palette.indiaGreen]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={{ flex: 1 }}
              />
            </View>

            <View ref={contentRef} collapsable={false}>
              {children}
            </View>
          </ScrollView>

          {footer ? (
            <View
              className="border-t border-border/50 bg-background px-5 pt-3"
              style={{ paddingBottom: Math.max(insets.bottom, 12) }}
            >
              {footer}
              {footerHint ? (
                <Text className="mt-2 text-center text-[12px] leading-[18px] text-muted">
                  {footerHint}
                </Text>
              ) : null}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </View>
    </AuthScrollContext.Provider>
  );
}

type SignupStepIndicatorProps = {
  current: number;
  total: number;
  labels?: string[];
};

function SignupStepIndicator({
  current,
  total,
  labels,
}: SignupStepIndicatorProps) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-center">
        {Array.from({ length: total }, (_, index) => {
          const step = index + 1;
          const active = step === current;
          const completed = step < current;

          return (
            <View key={step} className="flex-row items-center">
              <View
                className={`h-7 w-7 items-center justify-center rounded-full border-2 ${
                  active || completed
                    ? "border-india-green bg-surface"
                    : "border-border bg-background"
                }`}
              >
                {completed ? (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={Palette.indiaGreen}
                  />
                ) : (
                  <Text
                    className={`text-[11px] font-bold ${
                      active ? "text-india-green" : "text-muted"
                    }`}
                  >
                    {step}
                  </Text>
                )}
              </View>

              {step < total ? (
                <View
                  className={`mx-1 h-0.5 w-6 ${
                    step < current ? "bg-india-green" : "bg-border"
                  }`}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      {labels?.[current - 1] ? (
        <Text
          className="mt-2 text-center font-condensed-semibold text-[10px] uppercase tracking-[0.6px] text-india-green"
          style={
            Platform.OS === "android"
              ? { includeFontPadding: false }
              : undefined
          }
        >
          {labels[current - 1]}
        </Text>
      ) : null}
    </View>
  );
}

export function FormCard({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <View className="overflow-hidden rounded-2xl border border-india-green/60 bg-background">
      <View className="h-0.5 w-full overflow-hidden">
        <LinearGradient
          colors={[Palette.saffron, Palette.indiaGreen]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </View>
      <View className="gap-4 p-4">
        {title ? (
          <Text className="text-[13px] font-semibold uppercase tracking-[0.4px] text-india-green">
            {title}
          </Text>
        ) : null}
        {children}
      </View>
    </View>
  );
}

type SelectableCardProps = {
  label: string;
  description?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectableCard({
  label,
  description,
  icon,
  iconColor,
  iconBg,
  selected,
  onPress,
}: SelectableCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 ${
        selected
          ? "border-india-green bg-surface"
          : "border-border bg-background"
      }`}
    >
      <View
        className="h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: iconBg }}
      >
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>

      <View className="min-w-0 flex-1">
        <FittedText
          shrink
          maxLines={1}
          className="text-[15px] font-semibold text-indigo"
        >
          {label}
        </FittedText>
        {description ? (
          <FittedText
            shrink
            maxLines={2}
            className="mt-0.5 text-[12px] leading-[17px] text-muted"
          >
            {description}
          </FittedText>
        ) : null}
      </View>

      {selected ? (
        <Ionicons
          name="checkmark-circle"
          size={22}
          color={Palette.indiaGreen}
        />
      ) : (
        <View className="h-5 w-5 shrink-0 rounded-full border-2 border-border" />
      )}
    </Pressable>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <View className="flex-row items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
      <Ionicons name="alert-circle" size={18} color="#EF4444" />
      <Text className="flex-1 text-[13px] leading-[19px] text-red-600">
        {message}
      </Text>
    </View>
  );
}

export function ScrollField({
  fieldId,
  children,
}: {
  fieldId: string;
  children: React.ReactNode;
}) {
  const { fieldRef } = useRegisterScrollField(fieldId);

  return (
    <View ref={fieldRef} collapsable={false}>
      {children}
    </View>
  );
}
