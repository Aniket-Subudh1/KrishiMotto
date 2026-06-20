import { AuthRedirect } from '@/components/auth/auth-redirect';
import { Redirect, router, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  AuthScreenLayout,
  ErrorBanner,
  FormCard,
  SelectableCard,
} from '@/components/auth/auth-screen-layout';
import { Input, PhoneInput } from '@/components/ui/input';
import { OtpHint, OtpInput, ResendLink } from '@/components/ui/otp-input';
import { SlideButton } from '@/components/ui/slide-button';
import { Text } from '@/components/ui/text';
import {
  getMutationError,
  useAuthenticateFarmer,
  useRegisterFarmer,
  useSendOtp,
  useUpdateFarmerProfile,
} from '@/features/farmer/hooks/use-farmer-auth';
import { useAppLocale } from '@/hooks/use-app-locale';
import { clearLocalSession } from '@/lib/auth-session';
import {
  isValidCrop,
  isValidIndianPhone,
  isValidLocationField,
  isValidOtp,
  isValidProfileName,
  isValidSeason,
  isValidUsername,
  INDIAN_CROP_SEASONS,
  normalizePhoneInput,
} from '@/lib/validation';
import { Palette } from '@/constants/theme';
import { uploadService } from '@/services/upload.service';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';
import type { LandType } from '@/types/farmer';

type SignupStep = 'details' | 'otp' | 'profile';

const STEP_INDEX: Record<SignupStep, number> = {
  details: 1,
  otp: 2,
  profile: 3,
};

export default function FarmerSignUpScreen() {
  const { t } = useAppLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const intent = useAuthFlowStore((s) => s.intent);
  const selectedRole = useAuthFlowStore((s) => s.selectedRole);
  const hasEnteredFromGetStarted = useAuthFlowStore((s) => s.hasEnteredFromGetStarted);
  const storedPhone = useAuthFlowStore((s) => s.phoneNumber);
  const storedUsername = useAuthFlowStore((s) => s.username);
  const signupStep = useAuthFlowStore((s) => s.signupStep);
  const setPhoneNumber = useAuthFlowStore((s) => s.setPhoneNumber);
  const setUsername = useAuthFlowStore((s) => s.setUsername);
  const setSignupStep = useAuthFlowStore((s) => s.setSignupStep);
  const setStoredLandType = useAuthFlowStore((s) => s.setLandType);

  const registerFarmer = useRegisterFarmer();
  const sendOtp = useSendOtp();
  const authenticateFarmer = useAuthenticateFarmer();
  const updateProfile = useUpdateFarmerProfile();

  const resumeProfile = isAuthenticated && user?.role === 'FARMER' && !profileCompleted;
  const [step, setStep] = useState<SignupStep>(
    resumeProfile ? 'profile' : isAuthenticated ? 'profile' : 'details',
  );
  const [username, setUsernameLocal] = useState(storedUsername);
  const [phoneNumber, setPhoneLocal] = useState(storedPhone);
  const [otp, setOtp] = useState('');
  const [name, setName] = useState(storedUsername || user?.username || '');
  const [district, setDistrict] = useState('');
  const [state, setStateValue] = useState('');
  const [landType, setLandType] = useState<LandType>('OWNED');
  const [primaryCrop, setPrimaryCrop] = useState('');
  const [currentSeason, setCurrentSeason] = useState<string | null>(null);
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [slideResetKey, setSlideResetKey] = useState(0);
  const [otpResetKey, setOtpResetKey] = useState(0);

  useEffect(() => {
    setSlideResetKey((key) => key + 1);
    setFormError(null);
    setInfoMessage(null);
  }, [step]);

  const showBackConfirmation = useCallback(
    (message: string, onConfirm: () => void) => {
      Alert.alert(t('farmerSignUp.backWarningTitle'), message, [
        { text: t('farmerSignUp.backWarningCancel'), style: 'cancel' },
        {
          text: t('farmerSignUp.backWarningConfirm'),
          style: 'destructive',
          onPress: onConfirm,
        },
      ]);
    },
    [t],
  );

  const handleBack = useCallback(() => {
    if (step === 'otp') {
      showBackConfirmation(t('farmerSignUp.backFromOtpMessage'), () => {
        setOtp('');
        setFormError(null);
        setInfoMessage(null);
        setStep('details');
      });
      return;
    }

    if (step === 'profile') {
      showBackConfirmation(t('farmerSignUp.backFromProfileMessage'), () => {
        void clearLocalSession().then(() => {
          setOtp('');
          setFormError(null);
          setInfoMessage(null);
          setStep('details');
        });
      });
      return;
    }

    router.back();
  }, [showBackConfirmation, step, t]);

  useEffect(() => {
    if (step === 'details') {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });

    return () => subscription.remove();
  }, [handleBack, step]);

  if (isAuthenticated && profileCompleted) {
    return <AuthRedirect />;
  }

  if (isAuthenticated && signupStep === 'land') {
    return <Redirect href={'/farmer/land-boundary' as Href} />;
  }

  if (
    !resumeProfile &&
    (!hasEnteredFromGetStarted ||
      intent !== 'register' ||
      selectedRole !== 'farmer')
  ) {
    return <Redirect href={'/get-started' as Href} />;
  }

  const isBusy =
    registerFarmer.isPending ||
    sendOtp.isPending ||
    authenticateFarmer.isPending ||
    updateProfile.isPending;

  const stepLabels = [
    t('farmerSignUp.stepAccount'),
    t('farmerSignUp.stepVerify'),
    t('farmerSignUp.stepProfile'),
    t('farmerSignUp.stepBoundary'),
  ];

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

  async function handleDetailsSubmit() {
    setFormError(null);
    setInfoMessage(null);

    const trimmedUsername = username.trim();
    const normalizedPhone = normalizePhoneInput(phoneNumber);

    if (!isValidUsername(trimmedUsername)) {
      setFormError(t('farmerSignUp.errors.username'));
      bumpSlideReset();
      return;
    }

    if (!isValidIndianPhone(normalizedPhone)) {
      setFormError(t('farmerSignUp.errors.phone'));
      bumpSlideReset();
      return;
    }

    try {
      await registerFarmer.mutateAsync({
        username: trimmedUsername,
        phoneNumber: normalizedPhone,
      });
      await sendOtp.mutateAsync({ phoneNumber: normalizedPhone });

      setUsername(trimmedUsername);
      setPhoneNumber(normalizedPhone);
      setPhoneLocal(normalizedPhone);
      setUsernameLocal(trimmedUsername);
      setName(trimmedUsername);
      resetOtpInput();
      setStep('otp');
    } catch (error) {
      setFormError(getMutationError(error, t('farmerSignUp.errors.generic')));
      bumpSlideReset();
    }
  }

  async function handleOtpSubmit() {
    setFormError(null);
    setInfoMessage(null);

    if (!isValidOtp(otp)) {
      setFormError(t('farmerSignUp.errors.otp'));
      resetOtpInput();
      bumpSlideReset();
      return;
    }

    try {
      await authenticateFarmer.mutateAsync({
        phoneNumber: phoneNumber || storedPhone,
        otp,
      });
      setStep('profile');
    } catch (error) {
      setFormError(getMutationError(error, t('farmerSignUp.errors.otpInvalid')));
      resetOtpInput();
      bumpSlideReset();
    }
  }

  async function handleResendOtp() {
    setFormError(null);

    try {
      await sendOtp.mutateAsync({
        phoneNumber: phoneNumber || storedPhone,
      });
      resetOtpInput();
      setInfoMessage(t('farmerSignUp.otpResent'));
    } catch (error) {
      setFormError(getMutationError(error, t('farmerSignUp.errors.generic')));
    }
  }

  async function pickProfilePhoto() {
    const ImagePicker = await import('expo-image-picker');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('farmerSignUp.photoPermissionTitle'), t('farmerSignUp.photoPermissionMessage'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setProfilePhotoUri(result.assets[0].uri);
    }
  }

  async function handleProfileSubmit() {
    setFormError(null);
    setInfoMessage(null);

    if (!isValidProfileName(name)) {
      setFormError(t('farmerSignUp.errors.name'));
      bumpSlideReset();
      return;
    }

    if (!isValidLocationField(district)) {
      setFormError(t('farmerSignUp.errors.district'));
      bumpSlideReset();
      return;
    }

    if (!isValidLocationField(state)) {
      setFormError(t('farmerSignUp.errors.state'));
      bumpSlideReset();
      return;
    }

    if (primaryCrop.trim() && !isValidCrop(primaryCrop)) {
      setFormError(t('farmerSignUp.errors.primaryCrop'));
      bumpSlideReset();
      return;
    }

    if (currentSeason && !isValidSeason(currentSeason)) {
      setFormError(t('farmerSignUp.errors.currentSeason'));
      bumpSlideReset();
      return;
    }

    try {
      let profilePicKey: string | null = null;

      if (profilePhotoUri) {
        const contentType = 'image/jpeg';
        const { data: presignData } = await uploadService.presign('profile_pic', contentType);
        const presign = presignData.data;
        await uploadService.uploadToPresignedUrl(presign.uploadUrl, profilePhotoUri, contentType);
        profilePicKey = presign.assetKey;
      }

      await updateProfile.mutateAsync({
        name: name.trim(),
        district: district.trim(),
        state: state.trim(),
        country: t('farmerSignUp.countryValue'),
        landType,
        primaryCrop: primaryCrop.trim() || null,
        currentSeason: currentSeason || null,
        profilePicKey,
      });

      setStoredLandType(landType);
      setSignupStep('land');
      router.replace('/farmer/land-boundary' as Href);
    } catch (error) {
      setFormError(getMutationError(error, t('farmerSignUp.errors.generic')));
      bumpSlideReset();
    }
  }

  if (step === 'details') {
    return (
      <AuthScreenLayout
        currentStep={STEP_INDEX.details}
        totalSteps={4}
        stepLabels={stepLabels}
        title={t('farmerSignUp.detailsTitle')}
        subtitle={t('farmerSignUp.detailsSubtitle')}
        onBack={handleBack}
        footer={
          <SlideButton
            label={t('farmerSignUp.sendOtp')}
            hint={t('farmerSignUp.slideHint')}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handleDetailsSubmit}
          />
        }
        footerHint={t('selectRole.hint')}
      >
        <FormCard title={t('farmerSignUp.accountSection')}>
          <Input
            fieldId="signup-fullname"
            label={t('farmerSignUp.usernameLabel')}
            value={username}
            onChangeText={setUsernameLocal}
            placeholder={t('farmerSignUp.usernamePlaceholder')}
            icon="person-outline"
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
          />

          <PhoneInput
            fieldId="signup-phone"
            label={t('farmerSignUp.phoneLabel')}
            value={phoneNumber}
            onChangeText={(text) => setPhoneLocal(normalizePhoneInput(text))}
            placeholder={t('farmerSignUp.phonePlaceholder')}
            hint={t('farmerSignUp.phoneHint')}
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

  if (step === 'otp') {
    return (
      <AuthScreenLayout
        currentStep={STEP_INDEX.otp}
        totalSteps={4}
        stepLabels={stepLabels}
        title={t('farmerSignUp.otpTitle')}
        subtitle={t('farmerSignUp.otpSubtitle')}
        onBack={handleBack}
        footer={
          <View>
            <SlideButton
              label={t('farmerSignUp.verifyOtp')}
              hint={t('farmerSignUp.slideHint')}
              loading={isBusy}
              resetKey={slideResetKey}
              onComplete={handleOtpSubmit}
            />
            <ResendLink
              onPress={handleResendOtp}
              loading={sendOtp.isPending}
              label={t('farmerSignUp.resendOtp')}
            />
          </View>
        }
      >
        <View className="gap-5">
          <OtpHint phoneNumber={phoneNumber || storedPhone} />
          <FormCard>
            <OtpInput
              fieldId="signup-otp"
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

  return (
      <AuthScreenLayout
        currentStep={STEP_INDEX.profile}
        totalSteps={4}
        stepLabels={stepLabels}
        title={t('farmerSignUp.profileTitle')}
      subtitle={t('farmerSignUp.profileSubtitle')}
      onBack={handleBack}
      footer={
        <SlideButton
          label={t('farmerSignUp.continueToMap')}
          hint={t('farmerSignUp.slideHint')}
          loading={isBusy}
          resetKey={slideResetKey}
          onComplete={handleProfileSubmit}
        />
      }
      footerHint={t('selectRole.hint')}
    >
      <FormCard title={t('farmerSignUp.profileSection')}>
        <View className="items-center gap-2">
          <Pressable
            onPress={pickProfilePhoto}
            className="h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-india-green/50 bg-surface"
          >
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={{ width: 88, height: 88 }} contentFit="cover" />
            ) : (
              <View className="items-center gap-1">
                <Ionicons name="camera-outline" size={28} color={Palette.indiaGreen} />
                <Text className="text-[10px] font-semibold text-muted">{t('farmerSignUp.addPhoto')}</Text>
              </View>
            )}
          </Pressable>
          <Text className="text-[12px] text-muted">{t('farmerSignUp.photoHint')}</Text>
        </View>

        <Input
          fieldId="profile-name"
          label={t('farmerSignUp.nameLabel')}
          value={name}
          onChangeText={setName}
          placeholder={t('farmerSignUp.namePlaceholder')}
          icon="person-circle-outline"
          autoCapitalize="words"
        />

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              fieldId="profile-district"
              label={t('farmerSignUp.districtLabel')}
              value={district}
              onChangeText={setDistrict}
              placeholder={t('farmerSignUp.districtPlaceholder')}
              icon="location-outline"
              autoCapitalize="words"
            />
          </View>
          <View className="flex-1">
            <Input
              fieldId="profile-state"
              label={t('farmerSignUp.stateLabel')}
              value={state}
              onChangeText={setStateValue}
              placeholder={t('farmerSignUp.statePlaceholder')}
              icon="map-outline"
              autoCapitalize="characters"
            />
          </View>
        </View>

        <Input
          fieldId="profile-country"
          label={t('farmerSignUp.countryLabel')}
          value={t('farmerSignUp.countryValue')}
          editable={false}
          icon="flag-outline"
        />

        <View className="gap-2.5">
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 shrink-0 rounded-sm bg-india-green" />
            <Text className="font-condensed-semibold text-[11px] uppercase tracking-[0.5px] text-india-green">
              {t('farmerSignUp.currentSeasonLabel')}
            </Text>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {INDIAN_CROP_SEASONS.map((season) => (
              <Pressable
                key={season}
                onPress={() => setCurrentSeason(currentSeason === season ? null : season)}
                className={`rounded-full border px-4 py-2 ${
                  currentSeason === season
                    ? 'border-india-green bg-surface'
                    : 'border-border bg-background'
                }`}
              >
                <Text
                  className={`text-[13px] font-semibold ${
                    currentSeason === season ? 'text-india-green' : 'text-muted'
                  }`}
                >
                  {t(`farmerSignUp.seasons.${season.toLowerCase()}` as 'farmerSignUp.seasons.kharif')}
                </Text>
              </Pressable>
            ))}
          </View>
          <Text className="text-[12px] text-muted">{t('farmerSignUp.currentSeasonHint')}</Text>
        </View>

        <View className="gap-2.5">
          <View className="flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 shrink-0 rounded-sm bg-india-green" />
            <Text className="font-condensed-semibold text-[11px] uppercase tracking-[0.5px] text-india-green">
              {t('farmerSignUp.landTypeLabel')}
            </Text>
          </View>

          <View className="gap-2.5">
            <SelectableCard
              label={t('farmerSignUp.landOwned')}
              icon="home"
              iconColor={Palette.indiaGreen}
              iconBg="rgba(70, 150, 47, 0.12)"
              selected={landType === 'OWNED'}
              onPress={() => setLandType('OWNED')}
            />
            <SelectableCard
              label={t('farmerSignUp.landLeased')}
              icon="document-text"
              iconColor={Palette.saffron}
              iconBg="rgba(244, 164, 96, 0.16)"
              selected={landType === 'LEASED'}
              onPress={() => setLandType('LEASED')}
            />
          </View>
        </View>

        <Input
          fieldId="profile-crop"
          label={t('farmerSignUp.primaryCropLabel')}
          value={primaryCrop}
          onChangeText={setPrimaryCrop}
          placeholder={t('farmerSignUp.primaryCropPlaceholder')}
          icon="leaf-outline"
          autoCapitalize="words"
          hint={t('farmerSignUp.primaryCropHint')}
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
