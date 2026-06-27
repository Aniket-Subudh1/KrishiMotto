import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  View,
} from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { IndiaLocationFields } from '@/components/location/india-location-fields';
import { Input } from '@/components/ui/input';
import { KeyboardAwareFormShell } from '@/components/ui/keyboard-aware-form-shell';
import { Text } from '@/components/ui/text';
import { useLogout, useLogoutAll } from '@/features/auth/hooks/use-auth';
import { ProfileHeroHeader } from '@/features/home/components/profile-hero-header';
import {
  getFarmerProfileError,
  useUpdateFarmerProfile,
} from '@/features/farmer/hooks/use-farmer-profile';
import { formatAcres } from '@/lib/format';
import { resolveAppIcon, type IconName } from '@/lib/icon-names';
import {
  isValidLocationField,
  isValidProfileName,
} from '@/lib/validation';
import { Palette } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth.store';
import type { FarmerProfile } from '@/types/farmer';

type ProfileTabProps = {
  profile?: FarmerProfile;
  isLoading: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  t: (key: string) => string;
};

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

export function ProfileTab({
  profile,
  isLoading,
  isRefreshing,
  onRefresh,
  t,
}: ProfileTabProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const logoutAll = useLogoutAll();
  const updateProfile = useUpdateFarmerProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [primaryCrop, setPrimaryCrop] = useState('');

  const displayName = profile?.name ?? user?.username ?? t('home.profile.farmer');

  function startEditing() {
    setName(profile?.name ?? '');
    setDistrict(profile?.district ?? '');
    setState(profile?.state ?? '');
    setPrimaryCrop(profile?.primaryCrop ?? '');
    setIsEditing(true);
  }

  async function handleSave() {
    if (!isValidProfileName(name)) {
      Alert.alert('', t('home.profile.errors.name'));
      return;
    }
    if (!isValidLocationField(district)) {
      Alert.alert('', t('home.profile.errors.district'));
      return;
    }
    if (!isValidLocationField(state)) {
      Alert.alert('', t('home.profile.errors.state'));
      return;
    }

    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        district: district.trim(),
        state: state.trim(),
        primaryCrop: primaryCrop.trim() || null,
      });
      setIsEditing(false);
      Alert.alert('', t('home.profile.updateSuccess'));
    } catch (error) {
      Alert.alert('', getFarmerProfileError(error, t('home.profile.updateError')));
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
            <ProfileHeroHeader
              profile={profile}
              displayName={displayName}
              phoneNumber={user?.phoneNumber}
              onEditPress={startEditing}
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
                    label={t('home.profile.nameLabel')}
                    value={name}
                    onChangeText={setName}
                    icon="person-outline"
                  />
                  <IndiaLocationFields
                    state={state}
                    district={district}
                    onStateChange={setState}
                    onDistrictChange={setDistrict}
                    t={t}
                  />
                  <Input
                    label={t('home.profile.cropLabel')}
                    value={primaryCrop}
                    onChangeText={setPrimaryCrop}
                    icon="leaf-outline"
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
                  <SectionHeader icon="sprout-outline" title={t('home.profile.farmDetails')} />
                  <View className="gap-3">
                    <ProfileDetail
                      icon="resize-outline"
                      label={t('home.profile.totalAcres')}
                      value={profile?.totalAcres != null ? formatAcres(profile.totalAcres) : t('home.profile.notSet')}
                    />
                    <ProfileDetail
                      icon="document-text-outline"
                      label={t('home.profile.landType')}
                      value={
                        profile?.landType === 'LEASED'
                          ? t('home.land.landLeased')
                          : profile?.landType === 'OWNED'
                            ? t('home.land.landOwned')
                            : t('home.profile.notSet')
                      }
                    />
                    <ProfileDetail
                      icon="leaf-outline"
                      label={t('home.profile.cropLabel')}
                      value={profile?.primaryCrop ?? t('home.profile.notSet')}
                    />
                    <ProfileDetail
                      icon="calendar-outline"
                      label={t('home.profile.seasonLabel')}
                      value={profile?.currentSeason ?? t('home.profile.notSet')}
                    />
                  </View>
                </>
              )}
            </View>

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
                  value={user?.phoneNumber ? `+91 ${user.phoneNumber}` : t('home.profile.notSet')}
                  compact
                />
                <View className="h-px bg-border" />
                <ProfileDetail
                  icon="person-outline"
                  label={t('home.profile.roleLabel')}
                  value={t('home.profile.farmer')}
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
