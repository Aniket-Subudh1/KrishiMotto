import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { useLogoutAll } from '@/features/auth/hooks/use-auth';
import { ProfileHeroHeader } from '@/features/home/components/profile-hero-header';
import {
  getFarmerProfileError,
  useUpdateFarmerProfile,
} from '@/features/farmer/hooks/use-farmer-profile';
import { formatAcres } from '@/lib/format';
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

export function ProfileTab({
  profile,
  isLoading,
  isRefreshing,
  onRefresh,
  t,
}: ProfileTabProps) {
  const user = useAuthStore((s) => s.user);
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
    try {
      await updateProfile.mutateAsync({
        name: name.trim() || undefined,
        district: district.trim() || undefined,
        state: state.trim() || undefined,
        primaryCrop: primaryCrop.trim() || null,
      });
      setIsEditing(false);
      Alert.alert('', t('home.profile.updateSuccess'));
    } catch (error) {
      Alert.alert('', getFarmerProfileError(error, t('home.profile.updateError')));
    }
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
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

            <View className="mt-6 px-5">
              {isEditing ? (
                <View
                  className="gap-4 rounded-2xl border border-border bg-white p-4"
                  style={{
                    shadowColor: Palette.indigo,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                  }}
                >
                  <Text className="text-[18px] font-bold text-indigo">
                    {t('home.profile.edit')}
                  </Text>
                  <Input
                    label={t('home.profile.nameLabel')}
                    value={name}
                    onChangeText={setName}
                    icon="person-outline"
                  />
                  <Input
                    label={t('home.profile.districtLabel')}
                    value={district}
                    onChangeText={setDistrict}
                    icon="location-outline"
                  />
                  <Input
                    label={t('home.profile.stateLabel')}
                    value={state}
                    onChangeText={setState}
                    icon="map-outline"
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
                  <Text className="mb-3 text-[18px] font-bold text-indigo">
                    {t('home.profile.farmDetails')}
                  </Text>
                  <View className="gap-3">
                    <ProfileDetail
                      icon="resize-outline"
                      label={t('home.profile.totalAcres')}
                      value={profile?.totalAcres != null ? formatAcres(profile.totalAcres) : '—'}
                    />
                    <ProfileDetail
                      icon="document-text-outline"
                      label={t('home.profile.landType')}
                      value={
                        profile?.landType === 'LEASED'
                          ? t('home.land.landLeased')
                          : profile?.landType === 'OWNED'
                            ? t('home.land.landOwned')
                            : '—'
                      }
                    />
                    <ProfileDetail
                      icon="leaf-outline"
                      label={t('home.profile.cropLabel')}
                      value={profile?.primaryCrop ?? '—'}
                    />
                    <ProfileDetail
                      icon="calendar-outline"
                      label={t('home.profile.seasonLabel')}
                      value={profile?.currentSeason ?? '—'}
                    />
                  </View>
                </>
              )}
            </View>

            <View className="mt-6 px-5">
              <Text className="mb-3 text-[18px] font-bold text-indigo">
                {t('home.profile.accountSection')}
              </Text>
              <View
                className="overflow-hidden rounded-2xl border border-border bg-white"
                style={{
                  shadowColor: Palette.indigo,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <ProfileDetail
                  icon="call-outline"
                  label={t('home.profile.phoneLabel')}
                  value={user?.phoneNumber ? `+91 ${user.phoneNumber}` : '—'}
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

              <Button
                variant="danger"
                size="lg"
                className="mt-4"
                loading={logoutAll.isPending}
                onPress={handleLogoutAll}
              >
                {t('home.profile.logoutAll')}
              </Button>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ProfileDetail({
  icon,
  label,
  value,
  compact = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
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
        <Ionicons name={icon} size={18} color={Palette.indiaGreen} />
      </View>
      <View className="flex-1">
        <Text className="text-[11px] font-medium uppercase tracking-wide text-muted">{label}</Text>
        <Text className="text-[15px] font-semibold text-indigo">{value}</Text>
      </View>
    </View>
  );
}
