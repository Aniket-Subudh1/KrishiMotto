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
  useAuthenticateFarmer,
  useSendOtp,
} from '@/features/farmer/hooks/use-farmer-auth';
import { useAppLocale } from '@/hooks/use-app-locale';
import {
  applyAuthCompletion,
  deriveAuthCompletion,
  getAuthRedirectHref,
} from '@/lib/auth-routing';
import {
  isValidIndianPhone,
  isValidOtp,
  normalizePhoneInput,
} from '@/lib/validation';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';

type SignInStep = 'phone' | 'otp';

export default function FarmerSignInScreen() {
  const { t } = useAppLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const intent = useAuthFlowStore((s) => s.intent);
  const selectedRole = useAuthFlowStore((s) => s.selectedRole);
  const hasEnteredFromGetStarted = useAuthFlowStore((s) => s.hasEnteredFromGetStarted);
  const setPhoneNumber = useAuthFlowStore((s) => s.setPhoneNumber);

  const sendOtp = useSendOtp();
  const authenticateFarmer = useAuthenticateFarmer();

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
      Alert.alert(t('farmerSignIn.backWarningTitle'), message, [
        { text: t('farmerSignIn.backWarningCancel'), style: 'cancel' },
        {
          text: t('farmerSignIn.backWarningConfirm'),
          style: 'destructive',
          onPress: onConfirm,
        },
      ]);
    },
    [t],
  );

  const handleBack = useCallback(() => {
    if (step === 'otp') {
      showBackConfirmation(t('farmerSignIn.backFromOtpMessage'), () => {
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

  if (isAuthenticated && !isPostAuthRouting && !authenticateFarmer.isPending) {
    return <AuthRedirect />;
  }

  if (
    !hasEnteredFromGetStarted ||
    intent !== 'sign-in' ||
    selectedRole !== 'farmer'
  ) {
    return <Redirect href={'/get-started' as Href} />;
  }

  const isBusy = sendOtp.isPending || authenticateFarmer.isPending;

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
      setFormError(t('farmerSignIn.errors.phone'));
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
      setFormError(getMutationError(error, t('farmerSignIn.errors.generic')));
      bumpSlideReset();
    }
  }

  async function handleOtpSubmit() {
    setFormError(null);
    setInfoMessage(null);

    if (!isValidOtp(otp)) {
      setFormError(t('farmerSignIn.errors.otp'));
      bumpSlideReset();
      return;
    }

    try {
      setIsPostAuthRouting(true);
      await authenticateFarmer.mutateAsync({
        phoneNumber: phoneNumber,
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
      setFormError(getMutationError(error, t('farmerSignIn.errors.otpInvalid')));
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
      setInfoMessage(t('farmerSignIn.otpResent'));
    } catch (error) {
      setFormError(getMutationError(error, t('farmerSignIn.errors.generic')));
    }
  }

  if (step === 'phone') {
    return (
      <AuthScreenLayout
        title={t('farmerSignIn.title')}
        subtitle={t('farmerSignIn.subtitle')}
        onBack={handleBack}
        footer={
          <SlideButton
            label={t('farmerSignIn.sendOtp')}
            hint={t('farmerSignUp.slideHint')}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handlePhoneSubmit}
          />
        }
      >
        <FormCard>
          <PhoneInput
            fieldId="signin-phone"
            label={t('farmerSignIn.phoneLabel')}
            value={phoneNumber}
            onChangeText={(text) => setPhoneLocal(normalizePhoneInput(text))}
            placeholder={t('farmerSignIn.phonePlaceholder')}
            hint={t('farmerSignIn.phoneHint')}
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
      title={t('farmerSignIn.otpTitle')}
      subtitle={t('farmerSignIn.otpSubtitle')}
      onBack={handleBack}
      footer={
        <View>
          <SlideButton
            label={t('farmerSignIn.verifyOtp')}
            hint={t('farmerSignUp.slideHint')}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handleOtpSubmit}
          />
          <ResendLink
            onPress={handleResendOtp}
            loading={sendOtp.isPending}
            label={t('farmerSignIn.resendOtp')}
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
