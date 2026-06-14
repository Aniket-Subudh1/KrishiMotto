import { Redirect, router, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, BackHandler, View } from "react-native";

import { AuthRedirect } from "@/components/auth/auth-redirect";
import {
    AuthScreenLayout,
    ErrorBanner,
    FormCard,
} from "@/components/auth/auth-screen-layout";
import { PhoneInput } from "@/components/ui/input";
import { OtpHint, OtpInput, ResendLink } from "@/components/ui/otp-input";
import { SlideButton } from "@/components/ui/slide-button";
import { Text } from "@/components/ui/text";
import type { SelectableRole } from "@/constants/roles";
import { useAuthenticateAccount } from "@/features/auth/hooks/use-authenticate-account";
import { useSendOtp } from "@/features/auth/hooks/use-send-otp";
import { useAppLocale } from "@/hooks/use-app-locale";
import { getApiErrorMessage, isNotFoundError } from "@/lib/api-error";
import {
    applyAuthCompletion,
    deriveAuthCompletion,
    getAuthRedirectHref,
} from "@/lib/auth-routing";
import { toSelectableRole } from "@/lib/roles";
import {
    isValidIndianPhone,
    isValidOtp,
    normalizePhoneInput,
} from "@/lib/validation";
import { useAuthFlowStore } from "@/stores/auth-flow.store";
import { useAuthStore } from "@/stores/auth.store";

type SignInStep = "phone" | "otp";

export default function SignInScreen() {
  const { t } = useAppLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const intent = useAuthFlowStore((s) => s.intent);
  const hasEnteredFromGetStarted = useAuthFlowStore(
    (s) => s.hasEnteredFromGetStarted,
  );
  const setAuthFlow = useAuthFlowStore((s) => s.setAuthFlow);
  const setPhoneNumber = useAuthFlowStore((s) => s.setPhoneNumber);

  const sendOtp = useSendOtp();
  const authenticateAccount = useAuthenticateAccount();

  const [step, setStep] = useState<SignInStep>("phone");
  const [resolvedRole, setResolvedRole] = useState<SelectableRole | null>(null);
  const [phoneNumber, setPhoneLocal] = useState("");
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [slideResetKey, setSlideResetKey] = useState(0);
  const [otpResetKey, setOtpResetKey] = useState(0);
  const [isPostAuthRouting, setIsPostAuthRouting] = useState(false);

  useEffect(() => {
    setSlideResetKey((key) => key + 1);
    setFormError(null);
    setInfoMessage(null);
  }, [step]);

  const showBackConfirmation = useCallback(
    (message: string, onConfirm: () => void) => {
      Alert.alert(t("signIn.backWarningTitle"), message, [
        { text: t("signIn.backWarningCancel"), style: "cancel" },
        {
          text: t("signIn.backWarningConfirm"),
          style: "destructive",
          onPress: onConfirm,
        },
      ]);
    },
    [t],
  );

  const handleBack = useCallback(() => {
    if (step === "otp") {
      showBackConfirmation(t("signIn.backFromOtpMessage"), () => {
        setOtp("");
        setFormError(null);
        setInfoMessage(null);
        setStep("phone");
      });
      return;
    }

    router.back();
  }, [showBackConfirmation, step, t]);

  useEffect(() => {
    if (step === "phone") {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleBack();
        return true;
      },
    );

    return () => subscription.remove();
  }, [handleBack, step]);

  if (isAuthenticated && !isPostAuthRouting && !authenticateAccount.isPending) {
    return <AuthRedirect />;
  }

  if (!hasEnteredFromGetStarted || intent !== "sign-in") {
    return <Redirect href={"/get-started" as Href} />;
  }

  const isBusy = sendOtp.isPending || authenticateAccount.isPending;

  function bumpSlideReset() {
    setSlideResetKey((key) => key + 1);
  }

  function resetOtpInput() {
    setOtp("");
    setOtpResetKey((key) => key + 1);
  }

  function handleOtpChange(value: string) {
    setOtp(value);
    if (formError) setFormError(null);
    if (infoMessage) setInfoMessage(null);
  }

  async function handlePhoneSubmit() {
    setFormError(null);
    setInfoMessage(null);

    const normalizedPhone = normalizePhoneInput(phoneNumber);

    if (!isValidIndianPhone(normalizedPhone)) {
      setFormError(t("signIn.errors.phone"));
      bumpSlideReset();
      return;
    }

    try {
      const response = await sendOtp.mutateAsync({
        phoneNumber: normalizedPhone,
      });
      const role = response.accountRole
        ? toSelectableRole(response.accountRole)
        : null;

      if (!role) {
        setFormError(t("signIn.errors.notRegistered"));
        bumpSlideReset();
        return;
      }

      setResolvedRole(role);
      setAuthFlow("sign-in", role);
      setPhoneNumber(normalizedPhone);
      setPhoneLocal(normalizedPhone);
      resetOtpInput();
      setStep("otp");
    } catch (error) {
      const fallback = isNotFoundError(error)
        ? t("signIn.errors.notRegistered")
        : t("signIn.errors.generic");
      setFormError(getApiErrorMessage(error, fallback));
      bumpSlideReset();
    }
  }

  async function handleOtpSubmit() {
    setFormError(null);
    setInfoMessage(null);

    if (!resolvedRole) {
      setFormError(t("signIn.errors.generic"));
      bumpSlideReset();
      return;
    }

    if (!isValidOtp(otp)) {
      setFormError(t("signIn.errors.otp"));
      bumpSlideReset();
      return;
    }

    try {
      setIsPostAuthRouting(true);
      await authenticateAccount.mutateAsync({
        role: resolvedRole,
        phoneNumber: normalizePhoneInput(phoneNumber),
        otp,
      });

      const user = useAuthStore.getState().user;
      if (!user) {
        return;
      }

      const derived = await deriveAuthCompletion(
        user,
        useAuthFlowStore.getState().signupStep,
      );
      applyAuthCompletion(derived.profileCompleted, derived.signupStep);
      router.replace(
        getAuthRedirectHref(user, derived.profileCompleted, derived.signupStep),
      );
    } catch (error) {
      setFormError(getApiErrorMessage(error, t("signIn.errors.otpInvalid")));
      resetOtpInput();
      bumpSlideReset();
    } finally {
      setIsPostAuthRouting(false);
    }
  }

  async function handleResendOtp() {
    setFormError(null);

    try {
      const response = await sendOtp.mutateAsync({ phoneNumber });
      const role = response.accountRole
        ? toSelectableRole(response.accountRole)
        : resolvedRole;

      if (!role) {
        setFormError(t("signIn.errors.notRegistered"));
        return;
      }

      setResolvedRole(role);
      setAuthFlow("sign-in", role);
      resetOtpInput();
      setInfoMessage(t("signIn.otpResent"));
    } catch (error) {
      const fallback = isNotFoundError(error)
        ? t("signIn.errors.notRegistered")
        : t("signIn.errors.generic");
      setFormError(getApiErrorMessage(error, fallback));
    }
  }

  if (step === "phone") {
    return (
      <AuthScreenLayout
        title={t("signIn.welcomeBack")}
        subtitle={t("signIn.subtitle")}
        onBack={handleBack}
        footer={
          <SlideButton
            label={t("signIn.sendOtp")}
            hint={t("farmerSignUp.slideHint")}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handlePhoneSubmit}
          />
        }
      >
        <FormCard>
          <PhoneInput
            fieldId="signin-phone"
            label={t("signIn.phoneLabel")}
            value={phoneNumber}
            onChangeText={(text) => setPhoneLocal(normalizePhoneInput(text))}
            placeholder={t("signIn.phonePlaceholder")}
            hint={t("signIn.phoneHint")}
          />
        </FormCard>

        {formError ? (
          <View className="mt-4">
            <ErrorBanner message={formError} />
          </View>
        ) : null}
      </AuthScreenLayout>
    );
  }

  return (
    <AuthScreenLayout
      title={t("signIn.otpTitle")}
      subtitle={t("signIn.otpSubtitle")}
      onBack={handleBack}
      footer={
        <View>
          <SlideButton
            label={t("signIn.verifyOtp")}
            hint={t("farmerSignUp.slideHint")}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handleOtpSubmit}
          />
          <ResendLink
            onPress={handleResendOtp}
            loading={sendOtp.isPending}
            label={t("signIn.resendOtp")}
          />
        </View>
      }
    >
      <View className="gap-5">
        <OtpHint phoneNumber={phoneNumber} />
        <FormCard>
          <OtpInput
            fieldId="signin-otp"
            value={otp}
            onChange={handleOtpChange}
            error={formError ?? undefined}
            resetKey={otpResetKey}
          />
        </FormCard>
        {infoMessage ? (
          <View className="rounded-xl border border-india-green/30 bg-india-green/5 px-3.5 py-3">
            <Text className="text-center text-[13px] leading-[19px] text-india-green">
              {infoMessage}
            </Text>
          </View>
        ) : null}
      </View>
    </AuthScreenLayout>
  );
}
