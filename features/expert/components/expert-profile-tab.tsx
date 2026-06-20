import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyboardAwareFormShell } from '@/components/ui/keyboard-aware-form-shell';
import { Text } from '@/components/ui/text';
import { useLogout, useLogoutAll } from '@/features/auth/hooks/use-auth';
import { ExpertProfileHeroHeader } from '@/features/expert/components/expert-profile-hero-header';
import { useExpertHome } from '@/features/expert/context/expert-home-context';
import {
  getExpertProfileError,
  useUpdateExpertProfile,
} from '@/features/expert/hooks/use-expert-auth';
import {
  districtsToInput,
  formatExpertLocation,
  formatExpertServiceDistricts,
  formatExpertServicePincodes,
  getExpertProfilePhotoUrl,
  getKycDocumentLabelKey,
  pincodesToInput,
  translateExpertKycStatus,
} from '@/lib/expert-profile-display';
import { useAppLocale } from '@/hooks/use-app-locale';
import { resolveAppIcon, type IconName } from '@/lib/icon-names';
import {
  isValidExpertField,
  isValidLocationField,
  isValidProfileName,
  isValidYearsExperience,
  parseCommaSeparatedList,
  parsePincodeList,
} from '@/lib/validation';
import { Palette } from '@/constants/theme';
import { uploadService } from '@/services/upload.service';
import { rememberAssetPublicUrl } from '@/lib/upload-url-cache';
import { useAuthStore } from '@/stores/auth.store';
import type { ExpertKycDoc, ExpertProfile } from '@/types/expert';

function SectionHeader({ icon, title }: { icon: IconName; title: string }) {
  return (
    <View className="mb-4 flex-row items-center gap-2.5">
      <View
        className="h-8 w-8 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
      >
        <AppIcon name={resolveAppIcon(icon)} size={18} color={Palette.indiaGreen} />
      </View>
      <Text className="text-[18px] font-bold text-indigo">{title}</Text>
    </View>
  );
}

export function ExpertProfileTab() {
  const { t } = useAppLocale();
  const { profile, isLoading, isRefreshing, onRefresh } = useExpertHome();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const updateProfile = useUpdateExpertProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [name, setName] = useState('');
  const [specialisation, setSpecialisation] = useState('');
  const [qualification, setQualification] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [serviceDistrictsInput, setServiceDistrictsInput] = useState('');
  const [servicePincodesInput, setServicePincodesInput] = useState('');
  const [photoPreviewUri, setPhotoPreviewUri] = useState<string | null>(null);

  const displayName = profile?.name ?? user?.username ?? t('home.profile.expert');
  const phoneNumber = profile?.phone ?? user?.phoneNumber;
  const heroPhotoUri = photoPreviewUri ?? getExpertProfilePhotoUrl(profile);

  function startEditing() {
    setName(profile?.name ?? '');
    setSpecialisation(profile?.specialisation ?? '');
    setQualification(profile?.qualification ?? '');
    setYearsExperience(
      profile?.yearsExperience != null ? String(profile.yearsExperience) : '',
    );
    setServiceDistrictsInput(districtsToInput(profile?.serviceDistricts));
    setServicePincodesInput(pincodesToInput(profile?.servicePincodes));
    setIsEditing(true);
  }

  async function handlePhotoPress() {
    if (isPhotoUploading) {
      return;
    }

    const ImagePicker = await import('expo-image-picker');
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        t('expertSignUp.photoPermissionTitle'),
        t('expertSignUp.photoPermissionMessage'),
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.9,
    });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const asset = result.assets[0];
    const uri = asset.uri;
    const contentType = asset.mimeType ?? 'image/jpeg';
    setPhotoPreviewUri(uri);
    setIsPhotoUploading(true);

    try {
      const { data: presignData } = await uploadService.presign('profile_pic', contentType);
      const presign = presignData.data;
      await uploadService.uploadToPresignedUrl(presign.uploadUrl, uri, contentType);
      rememberAssetPublicUrl(presign.assetKey, presign.publicUrl);

      await updateProfile.mutateAsync({ profilePicKey: presign.assetKey });
      setPhotoPreviewUri(null);
      Alert.alert('', t('expertDashboard.profile.updateSuccess'));
    } catch (error) {
      setPhotoPreviewUri(null);
      Alert.alert('', getExpertProfileError(error, t('expertDashboard.profile.updateError')));
    } finally {
      setIsPhotoUploading(false);
    }
  }

  async function handleSave() {
    const parsedYears = Number.parseInt(yearsExperience, 10);
    const districts = parseCommaSeparatedList(serviceDistrictsInput).slice(0, 50);
    const pincodes = parsePincodeList(servicePincodesInput).slice(0, 200);

    if (!isValidProfileName(name)) {
      Alert.alert('', t('expertSignUp.errors.name'));
      return;
    }

    if (!isValidExpertField(specialisation)) {
      Alert.alert('', t('expertSignUp.errors.specialisation'));
      return;
    }

    if (!isValidExpertField(qualification)) {
      Alert.alert('', t('expertSignUp.errors.qualification'));
      return;
    }

    if (!isValidYearsExperience(parsedYears)) {
      Alert.alert('', t('expertSignUp.errors.yearsExperience'));
      return;
    }

    if (districts.length === 0 && pincodes.length === 0) {
      Alert.alert('', t('expertSignUp.errors.serviceArea'));
      return;
    }

    if (districts.some((district) => !isValidLocationField(district))) {
      Alert.alert('', t('expertSignUp.errors.serviceDistricts'));
      return;
    }

    const rawPincodes = parseCommaSeparatedList(servicePincodesInput);
    if (rawPincodes.length > 0 && pincodes.length !== rawPincodes.length) {
      Alert.alert('', t('expertSignUp.errors.servicePincodes'));
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        specialisation: specialisation.trim(),
        qualification: qualification.trim(),
        yearsExperience: parsedYears,
        serviceDistricts: districts,
        servicePincodes: pincodes,
      });

      setIsEditing(false);
      Alert.alert('', t('expertDashboard.profile.updateSuccess'));
    } catch (error) {
      Alert.alert('', getExpertProfileError(error, t('expertDashboard.profile.updateError')));
    }
  }

  function handleLogout() {
    Alert.alert(t('home.profile.logoutTitle'), t('home.profile.logoutMessage'), [
      { text: t('home.profile.logoutCancel'), style: 'cancel' },
      {
        text: t('home.profile.logoutConfirm'),
        onPress: () => logout.mutate(),
      },
    ]);
  }

  function handleLogoutAll() {
    Alert.alert(t('home.profile.logoutAllTitle'), t('home.profile.logoutAllMessage'), [
      { text: t('home.profile.logoutAllCancel'), style: 'cancel' },
      {
        text: t('home.profile.logoutAllConfirm'),
        style: 'destructive',
        onPress: () => logoutAll.mutate(),
      },
    ]);
  }

  return (
    <View className="flex-1 bg-background">
      <KeyboardAwareFormShell
        contentClassName="pb-8"
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={Palette.indiaGreen} />
          </View>
        ) : (
          <>
            <ExpertProfileHeroHeader
              profile={profile}
              displayName={displayName}
              phoneNumber={phoneNumber}
              photoUrl={heroPhotoUri}
              onEditPress={startEditing}
              onPhotoPress={handlePhotoPress}
              isPhotoUploading={isPhotoUploading}
              t={t}
            />

            <View className="mt-7 px-5">
              {isEditing ? (
                <View
                  className="gap-4 rounded-2xl border border-border bg-white p-4"
                  style={{
                    shadowColor: Palette.indigo,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                    elevation: 4,
                  }}
                >
                  <View className="flex-row items-center gap-2.5">
                    <View
                      className="h-8 w-8 items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
                    >
                      <AppIcon name="pencil-outline" size={18} color={Palette.indiaGreen} />
                    </View>
                    <Text className="text-[18px] font-bold text-indigo">
                      {t('home.profile.edit')}
                    </Text>
                  </View>

                  <Input
                    label={t('expertSignUp.nameLabel')}
                    value={name}
                    onChangeText={setName}
                    icon="person-outline"
                  />
                  <Input
                    label={t('expertSignUp.specialisationLabel')}
                    value={specialisation}
                    onChangeText={setSpecialisation}
                    icon="leaf-outline"
                  />
                  <Input
                    label={t('expertSignUp.qualificationLabel')}
                    value={qualification}
                    onChangeText={setQualification}
                    icon="school-outline"
                  />
                  <Input
                    label={t('expertSignUp.yearsExperienceLabel')}
                    value={yearsExperience}
                    onChangeText={setYearsExperience}
                    icon="calendar-outline"
                    keyboardType="number-pad"
                  />
                  <Input
                    label={t('expertSignUp.serviceDistrictsLabel')}
                    value={serviceDistrictsInput}
                    onChangeText={setServiceDistrictsInput}
                    icon="map-marker-outline"
                  />
                  <Input
                    label={t('expertSignUp.servicePincodesLabel')}
                    value={servicePincodesInput}
                    onChangeText={setServicePincodesInput}
                    icon="map-marker-radius"
                    keyboardType="number-pad"
                  />

                  <View className="flex-row gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onPress={() => setIsEditing(false)}
                    >
                      {t('home.profile.cancel')}
                    </Button>
                    <Button
                      className="flex-1"
                      loading={updateProfile.isPending}
                      onPress={handleSave}
                    >
                      {t('home.profile.save')}
                    </Button>
                  </View>
                </View>
              ) : (
                <>
                  <SectionHeader
                    icon="account-tie-outline"
                    title={t('expertDashboard.profile.professionalSection')}
                  />
                  <View className="gap-3">
                    <ProfileDetail
                      icon="mail-outline"
                      label={t('expertDashboard.profile.emailLabel')}
                      value={profile?.email ?? t('home.profile.notSet')}
                    />
                    <ProfileDetail
                      icon="leaf-outline"
                      label={t('expertSignUp.specialisationLabel')}
                      value={profile?.specialisation ?? t('home.profile.notSet')}
                    />
                    <ProfileDetail
                      icon="school-outline"
                      label={t('expertSignUp.qualificationLabel')}
                      value={profile?.qualification ?? t('home.profile.notSet')}
                    />
                    <ProfileDetail
                      icon="calendar-outline"
                      label={t('expertSignUp.yearsExperienceLabel')}
                      value={
                        profile?.yearsExperience != null
                          ? String(profile.yearsExperience)
                          : t('home.profile.notSet')
                      }
                    />
                    <ProfileDetail
                      icon="map-marker-outline"
                      label={t('expertDashboard.profile.serviceAreas')}
                      value={
                        formatExpertServiceDistricts(profile ?? ({} as ExpertProfile)) ||
                        t('home.profile.notSet')
                      }
                    />
                    <ProfileDetail
                      icon="map-marker-radius"
                      label={t('expertDashboard.profile.pincodesLabel')}
                      value={
                        formatExpertServicePincodes(profile ?? ({} as ExpertProfile)) ||
                        t('home.profile.notSet')
                      }
                    />
                  </View>

                  <View className="mt-7">
                    <SectionHeader
                      icon="shield-check-outline"
                      title={t('expertDashboard.profile.verificationSection')}
                    />
                    <View className="gap-3">
                      <ProfileDetail
                        icon="shield-check-outline"
                        label={t('expertDashboard.profile.kycStatusLabel')}
                        value={
                          profile
                            ? translateExpertKycStatus(t, profile.kycStatus)
                            : t('home.profile.notSet')
                        }
                      />
                      <ProfileDetail
                        icon="briefcase-check-outline"
                        label={t('expertDashboard.profile.canAcceptOrdersLabel')}
                        value={
                          profile?.canAcceptOrders
                            ? t('expertDashboard.profile.canAcceptOrdersYes')
                            : t('expertDashboard.profile.canAcceptOrdersNo')
                        }
                      />
                      <ProfileDetail
                        icon="crosshairs-gps"
                        label={t('expertDashboard.profile.locationLabel')}
                        value={formatExpertLocation(profile?.location) ?? t('home.profile.notSet')}
                      />
                      {profile?.location ? (
                        <Text className="px-1 text-[12px] leading-5 text-muted">
                          {t('expertDashboard.profile.locationHint')}
                        </Text>
                      ) : null}
                      {profile?.kycDocs?.length ? (
                        <View
                          className="overflow-hidden rounded-2xl border border-border bg-white"
                          style={{
                            shadowColor: Palette.indigo,
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.04,
                            shadowRadius: 4,
                            elevation: 1,
                          }}
                        >
                          <View className="border-b border-border px-4 py-3">
                            <Text className="text-[11px] font-medium uppercase tracking-wide text-muted">
                              {t('expertDashboard.profile.kycDocumentsLabel')}
                            </Text>
                          </View>
                          {profile.kycDocs.map((doc, index) => (
                            <KycDocumentRow
                              key={`${doc.type}-${doc.assetKey ?? index}`}
                              doc={doc}
                              t={t}
                              isLast={index === profile.kycDocs.length - 1}
                            />
                          ))}
                        </View>
                      ) : null}
                    </View>
                  </View>
                </>
              )}
            </View>

            {!isEditing ? (
              <View className="mt-7 px-5">
                <SectionHeader icon="account-outline" title={t('home.profile.accountSection')} />
                <View
                  className="overflow-hidden rounded-2xl border border-border bg-white"
                  style={{
                    shadowColor: Palette.indigo,
                    shadowOffset: { width: 0, height: 3 },
                    shadowOpacity: 0.08,
                    shadowRadius: 10,
                    elevation: 4,
                  }}
                >
                  <ProfileDetail
                    icon="call-outline"
                    label={t('home.profile.phoneLabel')}
                    value={phoneNumber ? `+91 ${phoneNumber}` : t('home.profile.notSet')}
                    compact
                  />
                  <View className="h-px bg-border" />
                  <ProfileDetail
                    icon="person-outline"
                    label={t('home.profile.roleLabel')}
                    value={t('home.profile.expert')}
                    compact
                  />
                </View>

                <View className="mt-4 gap-3">
                  <Button
                    variant="secondary"
                    size="lg"
                    loading={logout.isPending}
                    onPress={handleLogout}
                  >
                    {t('home.profile.logout')}
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    loading={logoutAll.isPending}
                    onPress={handleLogoutAll}
                  >
                    {t('home.profile.logoutAll')}
                  </Button>
                </View>
              </View>
            ) : null}
          </>
        )}
      </KeyboardAwareFormShell>
    </View>
  );
}

function ProfileDetail({
  icon,
  label,
  value,
  compact = false,
}: {
  icon: IconName;
  label: string;
  value: string;
  compact?: boolean;
}) {
  const cardShadow = compact
    ? undefined
    : {
        shadowColor: Palette.indigo,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 1,
      };

  return (
    <View
      className={`flex-row items-center gap-3 bg-white px-4 py-3.5 ${compact ? '' : 'rounded-2xl border border-border'}`}
      style={cardShadow}
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
      >
        <AppIcon name={resolveAppIcon(icon)} size={18} color={Palette.indiaGreen} />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</Text>
        <Text className="text-[15px] font-semibold text-indigo">{value}</Text>
      </View>
    </View>
  );
}

function KycDocumentRow({
  doc,
  t,
  isLast,
}: {
  doc: ExpertKycDoc;
  t: (key: string) => string;
  isLast: boolean;
}) {
  const labelKey = getKycDocumentLabelKey(doc.type);
  const label = t(`expertSignUp.kycDocs.${labelKey}` as 'expertSignUp.kycDocs.idCertificate');
  const verifiedLabel = doc.verifiedAt
    ? t('expertDashboard.profile.verifiedAt').replace(
        '{{date}}',
        new Date(doc.verifiedAt).toLocaleDateString(),
      )
    : null;

  return (
    <>
      <Pressable
        accessibilityRole={doc.documentUrl ? 'button' : undefined}
        disabled={!doc.documentUrl}
        onPress={() => {
          if (doc.documentUrl) {
            void Linking.openURL(doc.documentUrl);
          }
        }}
        className="flex-row items-center gap-3 px-4 py-3.5"
      >
        <View
          className="h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: 'rgba(244, 164, 96, 0.12)' }}
        >
          <AppIcon name="file-document-outline" size={18} color={Palette.saffron} />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[15px] font-semibold text-indigo">{label}</Text>
          {doc.label ? (
            <Text className="mt-0.5 text-[13px] text-muted">{doc.label}</Text>
          ) : null}
          {verifiedLabel ? (
            <Text className="mt-0.5 text-[12px] text-india-green">{verifiedLabel}</Text>
          ) : null}
        </View>
        {doc.documentUrl ? (
          <View className="flex-row items-center gap-1">
            <Text className="text-[12px] font-semibold text-saffron">
              {t('expertDashboard.profile.viewDocument')}
            </Text>
            <AppIcon name="open-in-new" size={16} color={Palette.saffron} />
          </View>
        ) : null}
      </Pressable>
      {!isLast ? <View className="h-px bg-border" /> : null}
    </>
  );
}
