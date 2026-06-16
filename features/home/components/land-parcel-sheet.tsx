import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  View,
} from 'react-native';

import { BottomSheetModal, BottomSheetScroll } from '@/components/ui/bottom-sheet-modal';
import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  getLandParcelError,
  useDeleteLandParcel,
  useLandParcel,
  useUpdateLandParcel,
} from '@/features/farmer/hooks/use-land-parcel';
import { useAppLocale } from '@/hooks/use-app-locale';
import { formatAcres, formatDate } from '@/lib/format';
import { resolveAppIcon, type IconName } from '@/lib/icon-names';
import { Palette } from '@/constants/theme';
import type { LandType } from '@/types/farmer';

type LandParcelSheetProps = {
  parcelId: string | null;
  visible: boolean;
  onClose: () => void;
};

export function LandParcelSheet({ parcelId, visible, onClose }: LandParcelSheetProps) {
  const { t } = useAppLocale();
  const { data: parcel, isLoading, isError } = useLandParcel(parcelId);
  const updateParcel = useUpdateLandParcel();
  const deleteParcel = useDeleteLandParcel();

  const [name, setName] = useState('');
  const [landType, setLandType] = useState<LandType>('OWNED');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (parcel) {
      setName(parcel.name);
      setLandType(parcel.landType);
      setIsEditing(false);
    }
  }, [parcel]);

  function handleClose() {
    setIsEditing(false);
    onClose();
  }

  function toggleEditing() {
    if (isEditing && parcel) {
      setName(parcel.name);
      setLandType(parcel.landType);
    }
    setIsEditing((value) => !value);
  }

  function handleEditBoundary(parcelBoundaryId: string) {
    handleClose();
    setTimeout(() => {
      router.push(`/farmer/land-boundary?parcelId=${parcelBoundaryId}` as Href);
    }, 180);
  }

  async function handleSave() {
    if (!parcelId || !name.trim()) {
      Alert.alert('', t('home.land.errors.nameRequired'));
      return;
    }

    try {
      await updateParcel.mutateAsync({
        id: parcelId,
        payload: { name: name.trim(), landType },
      });
      setIsEditing(false);
      Alert.alert('', t('home.land.updateSuccess'));
    } catch (error) {
      Alert.alert('', getLandParcelError(error, t('home.land.updateError')));
    }
  }

  function handleDelete() {
    if (!parcelId) return;

    Alert.alert(t('home.land.deleteTitle'), t('home.land.deleteMessage'), [
      { text: t('home.land.deleteCancel'), style: 'cancel' },
      {
        text: t('home.land.deleteConfirm'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteParcel.mutateAsync(parcelId);
            handleClose();
          } catch (error) {
            Alert.alert('', getLandParcelError(error, t('home.land.deleteError')));
          }
        },
      },
    ]);
  }

  const isBusy = updateParcel.isPending || deleteParcel.isPending;

  return (
    <BottomSheetModal
      visible={visible}
      onClose={handleClose}
      sheetClassName="max-h-[88%] rounded-t-[28px] bg-background"
    >
      <View className="items-center py-3">
        <View className="h-1 w-10 rounded-full bg-border" />
      </View>

      {isLoading ? (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color="#46962F" />
        </View>
      ) : isError || !parcel ? (
        <View className="items-center px-6 py-16">
          <Text className="text-center text-muted">{t('home.land.loadError')}</Text>
          <Button className="mt-4" variant="secondary" onPress={handleClose}>
            {t('home.land.close')}
          </Button>
        </View>
      ) : (
        <BottomSheetScroll className="px-6">
          <View className="mb-4 flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[13px] font-medium uppercase tracking-wide text-muted">
                    {t('home.land.fieldDetails')}
                  </Text>
                  <Text className="mt-1 text-[24px] font-bold text-indigo">{parcel.name}</Text>
                </View>
                <Pressable
                  onPress={toggleEditing}
                  className="h-11 w-11 items-center justify-center rounded-2xl bg-surface"
                >
                  <AppIcon
                    name={isEditing ? 'close' : 'pencil-outline'}
                    size={20}
                    color={Palette.indigo}
                  />
                </Pressable>
              </View>

              {isEditing ? (
                <View className="gap-4 pb-4">
                  <Input
                    label={t('home.land.nameLabel')}
                    value={name}
                    onChangeText={setName}
                    icon="text-outline"
                  />

                  <View className="gap-2">
                    <Text className="text-[14px] font-semibold text-indigo">
                      {t('home.land.landTypeLabel')}
                    </Text>
                    <View className="flex-row gap-3">
                      {(['OWNED', 'LEASED'] as const).map((type) => {
                        const selected = landType === type;
                        return (
                          <Pressable
                            key={type}
                            onPress={() => setLandType(type)}
                            className={`flex-1 flex-row items-center justify-center gap-2 rounded-2xl border px-3 py-3 ${
                              selected
                                ? 'border-india-green bg-india-green/10'
                                : 'border-border bg-white'
                            }`}
                          >
                            <AppIcon
                              name={type === 'OWNED' ? 'home-variant-outline' : 'file-sign'}
                              size={16}
                              color={selected ? Palette.indiaGreen : '#94A3B8'}
                            />
                            <Text
                              className={`text-[14px] font-semibold ${
                                selected ? 'text-india-green' : 'text-muted'
                              }`}
                            >
                              {type === 'OWNED'
                                ? t('home.land.landOwned')
                                : t('home.land.landLeased')}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <Button loading={isBusy} onPress={handleSave}>
                    {t('home.land.saveChanges')}
                  </Button>
                </View>
              ) : (
                <View className="gap-3 pb-4">
                  <DetailRow
                    icon="resize-outline"
                    label={t('home.land.areaLabel')}
                    value={formatAcres(parcel.areaAcres)}
                  />
                  <DetailRow
                    icon="document-text-outline"
                    label={t('home.land.landTypeLabel')}
                    value={
                      parcel.landType === 'OWNED'
                        ? t('home.land.landOwned')
                        : t('home.land.landLeased')
                    }
                  />
                  <DetailRow
                    icon="calendar-outline"
                    label={t('home.land.addedLabel')}
                    value={formatDate(parcel.createdAt)}
                  />
                  <DetailRow
                    icon="navigate-outline"
                    label={t('home.land.centroidLabel')}
                    value={`${parcel.centroid.coordinates[1].toFixed(4)}°, ${parcel.centroid.coordinates[0].toFixed(4)}°`}
                  />

                  <Button
                    variant="secondary"
                    onPress={() => {
                      handleEditBoundary(parcel.id);
                    }}
                  >
                    {t('home.land.editBoundary')}
                  </Button>
                </View>
              )}

              {!isEditing ? (
                <Button variant="danger" loading={deleteParcel.isPending} onPress={handleDelete}>
                  {t('home.land.deleteField')}
                </Button>
              ) : null}

          <View className="h-6" />
        </BottomSheetScroll>
      )}
    </BottomSheetModal>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
      >
        <AppIcon name={resolveAppIcon(icon)} size={18} color={Palette.indiaGreen} />
      </View>
      <View className="flex-1">
        <Text className="text-[12px] text-muted">{label}</Text>
        <Text className="text-[15px] font-semibold text-indigo">{value}</Text>
      </View>
    </View>
  );
}
