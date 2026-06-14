import { Redirect, router, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ExpertLocationPicker } from '@/components/expert/expert-location-picker';
import {
  AuthScreenLayout,
  ErrorBanner,
  FormCard,
} from '@/components/auth/auth-screen-layout';
import { AuthRedirect } from '@/components/auth/auth-redirect';
import { Input, PhoneInput } from '@/components/ui/input';
import { OtpHint, OtpInput, ResendLink } from '@/components/ui/otp-input';
import { SlideButton } from '@/components/ui/slide-button';
import { Text } from '@/components/ui/text';
import {
  getMutationError,
  useAuthenticateExpert,
  useRegisterExpert,
  useSendOtp,
  useSubmitExpertDocuments,
  useUpdateExpertProfile,
} from '@/features/expert/hooks/use-expert-auth';
import { useAppLocale } from '@/hooks/use-app-locale';
import {
  isValidEmail,
  isValidExpertField,
  isValidIndianPhone,
  isValidLocationField,
  isValidOtp,
  isValidProfileName,
  isValidUsername,
  isValidYearsExperience,
  normalizePhoneInput,
  parseCommaSeparatedList,
  parsePincodeList,
} from '@/lib/validation';
import { Palette } from '@/constants/theme';
import { uploadService } from '@/services/upload.service';
import { useAuthFlowStore } from '@/stores/auth-flow.store';
import { useAuthStore } from '@/stores/auth.store';
import { KYC_DOCUMENT_TYPES, type KycDocumentType } from '@/types/expert';

type SignupStep = 'details' | 'otp' | 'profile' | 'kyc' | 'location';

const STEP_INDEX: Record<SignupStep, number> = {
  details: 1,
  otp: 2,
  profile: 3,
  kyc: 4,
  location: 5,
};

type UploadedDocument = {
  type: KycDocumentType;
  assetKey: string;
  label?: string;
};

type PendingDocument = {
  type: KycDocumentType;
  uri: string;
  contentType: string;
  label?: string;
};

const KYC_DOC_LABELS: Record<KycDocumentType, string> = {
  ID_CERTIFICATE: 'idCertificate',
  QUALIFICATION: 'qualificationDoc',
  LICENSE: 'licenseDoc',
  OTHER: 'otherDoc',
};

export default function ExpertSignUpScreen() {
  const { t } = useAppLocale();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const profileCompleted = useAuthStore((s) => s.profileCompleted);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearAuthFlow = useAuthFlowStore((s) => s.clearAuthFlow);
  const intent = useAuthFlowStore((s) => s.intent);
  const selectedRole = useAuthFlowStore((s) => s.selectedRole);
  const hasEnteredFromGetStarted = useAuthFlowStore((s) => s.hasEnteredFromGetStarted);
  const storedPhone = useAuthFlowStore((s) => s.phoneNumber);
  const storedUsername = useAuthFlowStore((s) => s.username);
  const storedEmail = useAuthFlowStore((s) => s.storedEmail);
  const signupStep = useAuthFlowStore((s) => s.signupStep);
  const setPhoneNumber = useAuthFlowStore((s) => s.setPhoneNumber);
  const setUsername = useAuthFlowStore((s) => s.setUsername);
  const setStoredEmail = useAuthFlowStore((s) => s.setStoredEmail);
  const setSignupStep = useAuthFlowStore((s) => s.setSignupStep);

  const registerExpert = useRegisterExpert();
  const sendOtp = useSendOtp();
  const authenticateExpert = useAuthenticateExpert();
  const updateProfile = useUpdateExpertProfile();
  const submitDocuments = useSubmitExpertDocuments();

  const resumeProfile =
    isAuthenticated &&
    user?.role === 'EXPERT' &&
    !profileCompleted &&
    signupStep !== 'kyc' &&
    signupStep !== 'location';
  const resumeKyc =
    isAuthenticated && user?.role === 'EXPERT' && signupStep === 'kyc';
  const resumeLocation =
    isAuthenticated && user?.role === 'EXPERT' && signupStep === 'location';

  const [step, setStep] = useState<SignupStep>(() => {
    if (resumeLocation) return 'location';
    if (resumeKyc) return 'kyc';
    if (resumeProfile) return 'profile';
    if (isAuthenticated && user?.role === 'EXPERT') return 'profile';
    return 'details';
  });

  const [username, setUsernameLocal] = useState(storedUsername);
  const [email, setEmailLocal] = useState(storedEmail);
  const [phoneNumber, setPhoneLocal] = useState(storedPhone);
  const [otp, setOtp] = useState('');
  const [name, setName] = useState(storedUsername || user?.username || '');
  const [profileEmail, setProfileEmail] = useState(storedEmail || user?.email || '');
  const [profilePhone, setProfilePhone] = useState(storedPhone || user?.phoneNumber || '');
  const [specialisation, setSpecialisation] = useState('');
  const [qualification, setQualification] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [serviceDistrictsInput, setServiceDistrictsInput] = useState('');
  const [servicePincodesInput, setServicePincodesInput] = useState('');
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null);
  const [pendingDocuments, setPendingDocuments] = useState<Partial<Record<KycDocumentType, PendingDocument>>>({});
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
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
      Alert.alert(t('expertSignUp.backWarningTitle'), message, [
        { text: t('expertSignUp.backWarningCancel'), style: 'cancel' },
        {
          text: t('expertSignUp.backWarningConfirm'),
          style: 'destructive',
          onPress: onConfirm,
        },
      ]);
    },
    [t],
  );

  const handleBack = useCallback(() => {
    if (step === 'otp') {
      showBackConfirmation(t('expertSignUp.backFromOtpMessage'), () => {
        setOtp('');
        setFormError(null);
        setInfoMessage(null);
        setStep('details');
      });
      return;
    }

    if (step === 'profile') {
      showBackConfirmation(t('expertSignUp.backFromProfileMessage'), () => {
        clearAuth();
        clearAuthFlow();
        setOtp('');
        setFormError(null);
        setInfoMessage(null);
        setStep('details');
      });
      return;
    }

    if (step === 'kyc') {
      showBackConfirmation(t('expertSignUp.backFromKycMessage'), () => {
        setFormError(null);
        setInfoMessage(null);
        setUploadedDocuments([]);
        setStep('profile');
      });
      return;
    }

    if (step === 'location') {
      showBackConfirmation(t('expertSignUp.backFromLocationMessage'), () => {
        setFormError(null);
        setInfoMessage(null);
        setStep('kyc');
      });
      return;
    }

    router.back();
  }, [clearAuth, clearAuthFlow, showBackConfirmation, step, t]);

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

  if (isAuthenticated && signupStep === 'pending') {
    return <Redirect href={'/expert/pending' as Href} />;
  }

  if (
    !resumeProfile &&
    !resumeKyc &&
    !resumeLocation &&
    (!hasEnteredFromGetStarted || intent !== 'register' || selectedRole !== 'expert')
  ) {
    return <Redirect href={'/get-started' as Href} />;
  }

  const isBusy =
    registerExpert.isPending ||
    sendOtp.isPending ||
    authenticateExpert.isPending ||
    updateProfile.isPending ||
    submitDocuments.isPending;

  const stepLabels = [
    t('expertSignUp.stepAccount'),
    t('expertSignUp.stepVerify'),
    t('expertSignUp.stepProfile'),
    t('expertSignUp.stepKyc'),
    t('expertSignUp.stepLocation'),
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
    if (formError) setFormError(null);
    if (infoMessage) setInfoMessage(null);
  }

  async function handleDetailsSubmit() {
    setFormError(null);
    setInfoMessage(null);

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizePhoneInput(phoneNumber);

    if (!isValidUsername(trimmedUsername)) {
      setFormError(t('expertSignUp.errors.username'));
      bumpSlideReset();
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setFormError(t('expertSignUp.errors.email'));
      bumpSlideReset();
      return;
    }

    if (!isValidIndianPhone(normalizedPhone)) {
      setFormError(t('expertSignUp.errors.phone'));
      bumpSlideReset();
      return;
    }

    try {
      await registerExpert.mutateAsync({
        username: trimmedUsername,
        email: trimmedEmail,
        phoneNumber: normalizedPhone,
      });
      await sendOtp.mutateAsync({ phoneNumber: normalizedPhone });

      setUsername(trimmedUsername);
      setStoredEmail(trimmedEmail);
      setPhoneNumber(normalizedPhone);
      setPhoneLocal(normalizedPhone);
      setUsernameLocal(trimmedUsername);
      setEmailLocal(trimmedEmail);
      setName(trimmedUsername);
      setProfileEmail(trimmedEmail);
      setProfilePhone(normalizedPhone);
      resetOtpInput();
      setStep('otp');
    } catch (error) {
      setFormError(getMutationError(error, t('expertSignUp.errors.generic')));
      bumpSlideReset();
    }
  }

  async function handleOtpSubmit() {
    setFormError(null);
    setInfoMessage(null);

    if (!isValidOtp(otp)) {
      setFormError(t('expertSignUp.errors.otp'));
      bumpSlideReset();
      return;
    }

    try {
      await authenticateExpert.mutateAsync({
        phoneNumber: phoneNumber || storedPhone,
        otp,
      });
      setStep('profile');
    } catch (error) {
      setFormError(getMutationError(error, t('expertSignUp.errors.otpInvalid')));
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
      setInfoMessage(t('expertSignUp.otpResent'));
    } catch (error) {
      setFormError(getMutationError(error, t('expertSignUp.errors.generic')));
    }
  }

  async function pickProfilePhoto() {
    const ImagePicker = await import('expo-image-picker');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('expertSignUp.photoPermissionTitle'), t('expertSignUp.photoPermissionMessage'));
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

  async function pickKycDocument(type: KycDocumentType) {
    const ImagePicker = await import('expo-image-picker');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('expertSignUp.photoPermissionTitle'), t('expertSignUp.photoPermissionMessage'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPendingDocuments((prev) => ({
        ...prev,
        [type]: {
          type,
          uri: result.assets[0].uri,
          contentType: 'image/jpeg',
        },
      }));
    }
  }

  async function handleProfileSubmit() {
    setFormError(null);
    setInfoMessage(null);

    const parsedYears = Number.parseInt(yearsExperience, 10);
    const districts = parseCommaSeparatedList(serviceDistrictsInput).slice(0, 50);
    const pincodes = parsePincodeList(servicePincodesInput).slice(0, 200);

    if (!isValidProfileName(name)) {
      setFormError(t('expertSignUp.errors.name'));
      bumpSlideReset();
      return;
    }

    if (!isValidEmail(profileEmail)) {
      setFormError(t('expertSignUp.errors.email'));
      bumpSlideReset();
      return;
    }

    if (!isValidIndianPhone(normalizePhoneInput(profilePhone))) {
      setFormError(t('expertSignUp.errors.phone'));
      bumpSlideReset();
      return;
    }

    if (!isValidExpertField(specialisation)) {
      setFormError(t('expertSignUp.errors.specialisation'));
      bumpSlideReset();
      return;
    }

    if (!isValidExpertField(qualification)) {
      setFormError(t('expertSignUp.errors.qualification'));
      bumpSlideReset();
      return;
    }

    if (!isValidYearsExperience(parsedYears)) {
      setFormError(t('expertSignUp.errors.yearsExperience'));
      bumpSlideReset();
      return;
    }

    if (districts.length === 0 && pincodes.length === 0) {
      setFormError(t('expertSignUp.errors.serviceArea'));
      bumpSlideReset();
      return;
    }

    if (districts.some((d) => !isValidLocationField(d))) {
      setFormError(t('expertSignUp.errors.serviceDistricts'));
      bumpSlideReset();
      return;
    }

    const rawPincodes = parseCommaSeparatedList(servicePincodesInput);
    if (rawPincodes.length > 0 && pincodes.length !== rawPincodes.length) {
      setFormError(t('expertSignUp.errors.servicePincodes'));
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
        email: profileEmail.trim().toLowerCase(),
        phone: normalizePhoneInput(profilePhone),
        specialisation: specialisation.trim(),
        qualification: qualification.trim(),
        yearsExperience: parsedYears,
        serviceDistricts: districts,
        servicePincodes: pincodes,
        profilePicKey,
      });

      setSignupStep('kyc');
      setStep('kyc');
    } catch (error) {
      setFormError(getMutationError(error, t('expertSignUp.errors.generic')));
      bumpSlideReset();
    }
  }

  async function handleKycSubmit() {
    setFormError(null);
    setInfoMessage(null);

    const docs = KYC_DOCUMENT_TYPES.map((type) => pendingDocuments[type]).filter(
      (doc): doc is PendingDocument => Boolean(doc),
    );

    if (!pendingDocuments.ID_CERTIFICATE) {
      setFormError(t('expertSignUp.errors.idRequired'));
      bumpSlideReset();
      return;
    }

    if (docs.length === 0) {
      setFormError(t('expertSignUp.errors.documentsRequired'));
      bumpSlideReset();
      return;
    }

    try {
      const uploaded = await Promise.all(
        docs.map(async (doc) => {
          const { data: presignData } = await uploadService.presign(
            'kyc_certificate',
            doc.contentType,
          );
          const presign = presignData.data;
          await uploadService.uploadToPresignedUrl(presign.uploadUrl, doc.uri, doc.contentType);
          return {
            type: doc.type,
            assetKey: presign.assetKey,
            label: doc.label,
          };
        }),
      );

      setUploadedDocuments(uploaded);
      setSignupStep('location');
      setStep('location');
    } catch (error) {
      setFormError(getMutationError(error, t('expertSignUp.errors.generic')));
      bumpSlideReset();
    }
  }

  async function handleLocationSubmit(confirmedLatitude: number, confirmedLongitude: number) {
    setFormError(null);
    setInfoMessage(null);

    if (uploadedDocuments.length === 0) {
      setFormError(t('expertSignUp.errors.documentsRequired'));
      setSignupStep('kyc');
      setStep('kyc');
      return;
    }

    try {
      await submitDocuments.mutateAsync({
        documents: uploadedDocuments,
        latitude: confirmedLatitude,
        longitude: confirmedLongitude,
      });

      setSignupStep('pending');
      router.replace('/expert/pending' as Href);
    } catch (error) {
      setFormError(getMutationError(error, t('expertSignUp.errors.generic')));
    }
  }

  if (step === 'details') {
    return (
      <AuthScreenLayout
        currentStep={STEP_INDEX.details}
        totalSteps={5}
        stepLabels={stepLabels}
        title={t('expertSignUp.detailsTitle')}
        subtitle={t('expertSignUp.detailsSubtitle')}
        onBack={handleBack}
        footer={
          <SlideButton
            label={t('expertSignUp.sendOtp')}
            hint={t('expertSignUp.slideHint')}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handleDetailsSubmit}
          />
        }
        footerHint={t('selectRole.hint')}
      >
        <FormCard title={t('expertSignUp.accountSection')}>
          <Input
            fieldId="expert-signup-fullname"
            label={t('expertSignUp.usernameLabel')}
            value={username}
            onChangeText={setUsernameLocal}
            placeholder={t('expertSignUp.usernamePlaceholder')}
            icon="person-outline"
            autoCapitalize="words"
            autoCorrect={false}
          />

          <Input
            fieldId="expert-signup-email"
            label={t('expertSignUp.emailLabel')}
            value={email}
            onChangeText={setEmailLocal}
            placeholder={t('expertSignUp.emailPlaceholder')}
            icon="mail-outline"
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <PhoneInput
            fieldId="expert-signup-phone"
            label={t('expertSignUp.phoneLabel')}
            value={phoneNumber}
            onChangeText={(text) => setPhoneLocal(normalizePhoneInput(text))}
            placeholder={t('expertSignUp.phonePlaceholder')}
            hint={t('expertSignUp.phoneHint')}
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
        totalSteps={5}
        stepLabels={stepLabels}
        title={t('expertSignUp.otpTitle')}
        subtitle={t('expertSignUp.otpSubtitle')}
        onBack={handleBack}
        footer={
          <View>
            <SlideButton
              label={t('expertSignUp.verifyOtp')}
              hint={t('expertSignUp.slideHint')}
              loading={isBusy}
              resetKey={slideResetKey}
              onComplete={handleOtpSubmit}
            />
            <ResendLink
              onPress={handleResendOtp}
              loading={sendOtp.isPending}
              label={t('expertSignUp.resendOtp')}
            />
          </View>
        }
      >
        <View className="gap-5">
          <OtpHint phoneNumber={phoneNumber || storedPhone} />
          <FormCard>
            <OtpInput
              fieldId="expert-signup-otp"
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

  if (step === 'profile') {
    return (
      <AuthScreenLayout
        currentStep={STEP_INDEX.profile}
        totalSteps={5}
        stepLabels={stepLabels}
        title={t('expertSignUp.profileTitle')}
        subtitle={t('expertSignUp.profileSubtitle')}
        onBack={handleBack}
        footer={
          <SlideButton
            label={t('expertSignUp.continueToKyc')}
            hint={t('expertSignUp.slideHint')}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handleProfileSubmit}
          />
        }
        footerHint={t('selectRole.hint')}
      >
        <FormCard title={t('expertSignUp.profileSection')}>
          <View className="items-center gap-2">
            <Pressable
              onPress={pickProfilePhoto}
              className="h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-saffron/50 bg-surface"
            >
              {profilePhotoUri ? (
                <Image
                  source={{ uri: profilePhotoUri }}
                  style={{ width: 88, height: 88 }}
                  contentFit="cover"
                />
              ) : (
                <View className="items-center gap-1">
                  <Ionicons name="camera-outline" size={28} color={Palette.saffron} />
                  <Text className="text-[10px] font-semibold text-muted">
                    {t('expertSignUp.addPhoto')}
                  </Text>
                </View>
              )}
            </Pressable>
            <Text className="text-[12px] text-muted">{t('expertSignUp.photoHint')}</Text>
          </View>

          <Input
            fieldId="expert-profile-name"
            label={t('expertSignUp.nameLabel')}
            value={name}
            onChangeText={setName}
            placeholder={t('expertSignUp.namePlaceholder')}
            icon="person-circle-outline"
            autoCapitalize="words"
          />

          <Input
            fieldId="expert-profile-email"
            label={t('expertSignUp.emailLabel')}
            value={profileEmail}
            onChangeText={setProfileEmail}
            placeholder={t('expertSignUp.emailPlaceholder')}
            icon="mail-outline"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <PhoneInput
            fieldId="expert-profile-phone"
            label={t('expertSignUp.phoneLabel')}
            value={profilePhone}
            onChangeText={(text) => setProfilePhone(normalizePhoneInput(text))}
            placeholder={t('expertSignUp.phonePlaceholder')}
            hint={t('expertSignUp.phoneHint')}
          />

          <Input
            fieldId="expert-specialisation"
            label={t('expertSignUp.specialisationLabel')}
            value={specialisation}
            onChangeText={setSpecialisation}
            placeholder={t('expertSignUp.specialisationPlaceholder')}
            icon="leaf-outline"
            autoCapitalize="words"
          />

          <Input
            fieldId="expert-qualification"
            label={t('expertSignUp.qualificationLabel')}
            value={qualification}
            onChangeText={setQualification}
            placeholder={t('expertSignUp.qualificationPlaceholder')}
            icon="school-outline"
            autoCapitalize="words"
          />

          <Input
            fieldId="expert-years"
            label={t('expertSignUp.yearsExperienceLabel')}
            value={yearsExperience}
            onChangeText={(text) => setYearsExperience(text.replace(/\D/g, '').slice(0, 2))}
            placeholder={t('expertSignUp.yearsExperiencePlaceholder')}
            icon="time-outline"
            keyboardType="number-pad"
            hint={t('expertSignUp.yearsExperienceHint')}
          />

          <Input
            fieldId="expert-districts"
            label={t('expertSignUp.serviceDistrictsLabel')}
            value={serviceDistrictsInput}
            onChangeText={setServiceDistrictsInput}
            placeholder={t('expertSignUp.serviceDistrictsPlaceholder')}
            icon="location-outline"
            autoCapitalize="words"
            hint={t('expertSignUp.serviceDistrictsHint')}
          />

          <Input
            fieldId="expert-pincodes"
            label={t('expertSignUp.servicePincodesLabel')}
            value={servicePincodesInput}
            onChangeText={setServicePincodesInput}
            placeholder={t('expertSignUp.servicePincodesPlaceholder')}
            icon="pin-outline"
            keyboardType="number-pad"
            hint={t('expertSignUp.servicePincodesHint')}
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

  if (step === 'kyc') {
    return (
      <AuthScreenLayout
        currentStep={STEP_INDEX.kyc}
        totalSteps={5}
        stepLabels={stepLabels}
        title={t('expertSignUp.kycTitle')}
        subtitle={t('expertSignUp.kycSubtitle')}
        onBack={handleBack}
        footer={
          <SlideButton
            label={t('expertSignUp.continueToLocation')}
            hint={t('expertSignUp.slideHint')}
            loading={isBusy}
            resetKey={slideResetKey}
            onComplete={handleKycSubmit}
          />
        }
        footerHint={t('expertSignUp.kycFooterHint')}
      >
        <FormCard title={t('expertSignUp.kycSection')}>
          {KYC_DOCUMENT_TYPES.map((type) => {
            const uploaded = pendingDocuments[type];
            const isRequired = type === 'ID_CERTIFICATE';

            return (
              <Pressable
                key={type}
                onPress={() => pickKycDocument(type)}
                className="flex-row items-center gap-3 rounded-xl border border-border bg-background px-3.5 py-3.5"
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'rgba(244, 164, 96, 0.16)' }}
                >
                  <Ionicons
                    name={uploaded ? 'checkmark-circle' : 'document-outline'}
                    size={22}
                    color={uploaded ? Palette.indiaGreen : Palette.saffron}
                  />
                </View>
                <View className="min-w-0 flex-1">
                  <Text className="text-[14px] font-semibold text-indigo">
                    {t(`expertSignUp.kycDocs.${KYC_DOC_LABELS[type]}` as 'expertSignUp.kycDocs.idCertificate')}
                    {isRequired ? ' *' : ''}
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-muted">
                    {uploaded
                      ? t('expertSignUp.kycUploaded')
                      : t('expertSignUp.kycTapToUpload')}
                  </Text>
                </View>
                <Ionicons name="cloud-upload-outline" size={20} color={Palette.saffron} />
              </Pressable>
            );
          })}
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
    <ExpertLocationPicker
      stepLabel={t('expertSignUp.stepLocation')}
      title={t('expertSignUp.locationTitle')}
      subtitle={t('expertSignUp.locationSubtitle')}
      instructionTitle={t('expertSignUp.locationInstructionTitle')}
      instructionBody={t('expertSignUp.locationInstructionBody')}
      confirmLabel={t('expertSignUp.locationConfirm')}
      coordsLabel={t('expertSignUp.locationCoords')}
      locationDeniedLabel={t('expertSignUp.locationDenied')}
      mapsUnavailableLabel={t('expertSignUp.mapsUnavailable')}
      loadingMapLabel={t('expertSignUp.loadingMap')}
      onBack={handleBack}
      onConfirm={handleLocationSubmit}
      isSubmitting={isBusy}
      error={formError}
    />
  );
}
