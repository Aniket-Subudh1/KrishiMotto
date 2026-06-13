import { Redirect, router, type Href } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, View } from 'react-native';

import {
  AuthScreenLayout,
  ErrorBanner,
  FormCard,
} from '@/components/auth/auth-screen-layout';
import { AuthRedirect } from '@/components/auth/auth-redirect';
import { PhoneInput } from '@/components/ui/input';
import { OtpHint, OtpInput, ResendLink } from '@/components/ui/otp-input';
import { SlideButton } from '@/components/ui/slide-button';
import { Text } from '@/components/ui/text';
import {
  getMutationError,
  useAuthenticateExpert,
  useSendOtp,
} from '@/features/expert/hooks/use-expert-auth';
import {
  applyAuthCompletion,
  deriveAuthCompletion,
  getAuthRedirectHref,
} from '@/lib/auth-routing';
import { useAppLocale } from '@/hooks/use-app-locale';
import {
  isValidIndianPhone,
  isValidOtp,
  normalizePhoneInput,
} from '@/lib/validation';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';

type SignInStep = 'phone' | 'otp';

export default function ExpertSignInScreen() {
  const { t } = useAppLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const intent = useAuthFlowStore((s) => s.intent);
  const selectedRole = useAuthFlowStore((s) => s.selectedRole);
  const hasEnteredFromGetStarted = useAuthFlowStore((s) => s.hasEnteredFromGetStarted);
  const setPhoneNumber = useAuthFlowStore((s) => s.setPhoneNumber);

  const sendOtp = useSendOtp();
  const authenticateExpert = useAuthenticateExpert();

  const [step, setStep] = useState<SignInStep>('phone');
  const [phoneNumber, setPhoneLocal] = useState('');
  const [otp, setOtp] = useState('');
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
      Alert.alert(t('expertSignIn.backWarningTitle'), message, [
        { text: t('expertSignIn.backWarningCancel'), style: 'cancel' },
        {
          text: t('expertSignIn.backWarningConfirm'),
          style: 'destructive',
          onPress: onConfirm,
        },
      ]);
    },
    [t],
  );

  const handleBack = useCallback(() => {
    if (step === 'otp') {
      showBackConfirmation(t('expertSignIn.backFromOtpMessage'), () => {
        setOtp('');
        setFormError(null);
        setInfoMessage(null);
        setStep('phone');
      });
      return;
    }

    router.back();
  }, [showBackConfirmation, step, t]);

  useEffect(() => {
    if (step === 'phone') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => subscription.remove();
  }, [handleBack, step]);

  if (isAuthenticated && !isPostAuthRouting && !authenticateExpert.isPending) {
    return <AuthRedirect />;
  }

  if (
    !hasEnteredFromGetStarted ||
    intent !== 'sign-in' ||
    selectedRole !== 'expert'
  ) {
    return <Redirect href={'/get-started' as Href} />;
  }

  const isBusy = sendOtp.isPending || authenticateExpert.isPending;

  function bumpSlideReset() {
    setSlideResetKey((key) => key + 1);
  }

  function resetOtpInput() {
    setOtp('');
    setOtpResetKey((key) => key + 1);
  }

  function handleOtpChange(value: string) {
    setOtp(value);
    if (formError) {
      setFormError(null);
    }
    if (infoMessage) {
      setInfoMessage(null);
    }
  }

  async function handlePhoneSubmit() {
    setFormError(null);
    setInfoMessage(null);

    const normalizedPhone = normalizePhoneInput(phoneNumber);

    if (!isValidIndianPhone(normalizedPhone)) {
      setFormError(t('expertSignIn.errors.phone'));
      bumpSlideReset();
      return;
    }

    try {
      await sendOtp.mutateAsync({ phoneNumber: normalizedPhone });
      setPhoneNumber(normalizedPhone);
      setPhoneLocal(normalizedPhone);
      resetOtpInput();
      setStep('otp');
    } catch (error) {
      setFormError(getMutationError(error, t('expertSignIn.errors.generic')));
      bumpSlideReset();
    }
  }

  async function handleOtpSubmit() {
    setFormError(null);
    setInfoMessage(null);

    if (!isValidOtp(otp)) {
      setFormError(t('expertSignIn.errors.otp'));
      bumpSlideReset();
      return;
    }

    try {
      setIsPostAuthRouting(true);
      await authenticateExpert.mutateAsync({
        phoneNumber,
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
      setFormError(getMutationError(error, t('expertSignIn.errors.otpInvalid')));
      resetOtpInput();
      bumpSlideReset();
    } finally {
      setIsPostAuthRouting(false);
    }
  }

  async function handleResendOtp() {
    setFormError(null);

    try {
      await sendOtp.mutateAsync({ phoneNumber });
      resetOtpInput();
      setInfoMessage(t('expertSignIn.otpResent'));
    } catch (error) {
      setFormError(getMutationError(error, t('expertSignIn.errors.generic')));
    }
  }

  if (step === 'phone') {
    return (
      <AuthScreenLayout
        title={t('expertSignIn.title')}
        subtitle={t('expertSignIn.subtitle')}
        onBack={handleBack}
        footer={
          <SlideButton
            label={t('expertSignIn.sendOtp')}
            hint={t('expertSignUp.slideHint')}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handlePhoneSubmit}
          />
        }
      >
        <FormCard>
          <PhoneInput
            fieldId="expert-signin-phone"
            label={t('expertSignIn.phoneLabel')}
            value={phoneNumber}
            onChangeText={(text) => setPhoneLocal(normalizePhoneInput(text))}
            placeholder={t('expertSignIn.phonePlaceholder')}
            hint={t('expertSignIn.phoneHint')}
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
      title={t('expertSignIn.otpTitle')}
      subtitle={t('expertSignIn.otpSubtitle')}
      onBack={handleBack}
      footer={
        <View>
          <SlideButton
            label={t('expertSignIn.verifyOtp')}
            hint={t('expertSignUp.slideHint')}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handleOtpSubmit}
          />
          <ResendLink
            onPress={handleResendOtp}
            loading={sendOtp.isPending}
            label={t('expertSignIn.resendOtp')}
          />
        </View>
      }
    >
      <View className="gap-5">
        <OtpHint phoneNumber={phoneNumber} />
        <FormCard>
          <OtpInput
            fieldId="expert-signin-otp"
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
