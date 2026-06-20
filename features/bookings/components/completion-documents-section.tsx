import * as ImagePicker from 'expo-image-picker';
import { Linking, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import {
  getBookingError,
  useAttachCompletionDocument,
} from '@/features/bookings/hooks/use-booking';
import { canUploadCompletionDocument } from '@/features/bookings/utils/booking-progress';
import { useAppLocale } from '@/hooks/use-app-locale';
import { formatBookingDate } from '@/features/home/utils/booking-display';
import { Palette } from '@/constants/theme';
import type { Booking, BookingCompletionDocument } from '@/types/booking';
import { useState } from 'react';

type CompletionDocumentsSectionProps = {
  booking: Booking;
  t: (key: string) => string;
};

export function CompletionDocumentsSection({ booking, t }: CompletionDocumentsSectionProps) {
  const { locale } = useAppLocale();
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const attachDocument = useAttachCompletionDocument(booking.id);
  const documents = booking.completionDocuments ?? [];
  const canUpload = canUploadCompletionDocument(booking.bookingStatus);

  async function handlePickAndUpload() {
    setError(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t('bookingDetail.uploadPermissionDenied'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const contentType =
      asset.mimeType === 'image/png'
        ? 'image/png'
        : asset.mimeType === 'image/webp'
          ? 'image/webp'
          : 'image/jpeg';

    try {
      await attachDocument.mutateAsync({
        uri: asset.uri,
        contentType,
        label: label.trim() || t('bookingDetail.defaultDocumentLabel'),
      });
      setLabel('');
    } catch (uploadError) {
      setError(getBookingError(uploadError, t('bookingDetail.uploadError')));
    }
  }

  return (
    <View className="rounded-2xl border border-border bg-white p-4">
      <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
        {t('bookingDetail.documentsTitle')}
      </Text>
      <Text className="mt-1 text-[13px] leading-5 text-muted">
        {canUpload ? t('bookingDetail.documentsHint') : t('bookingDetail.documentsHintLocked')}
      </Text>

      {documents.length > 0 ? (
        <View className="mt-4 gap-2">
          {documents.map((doc) => (
            <DocumentRow key={`${doc.assetKey}-${doc.uploadedAt}`} doc={doc} t={t} locale={locale} />
          ))}
        </View>
      ) : (
        <View className="mt-4 rounded-xl border border-dashed border-border bg-surface px-4 py-5">
          <Text className="text-center text-[13px] leading-5 text-muted">
            {t('bookingDetail.noDocuments')}
          </Text>
        </View>
      )}

      {canUpload ? (
        <View className="mt-4 gap-3">
          <Input
            label={t('bookingDetail.documentLabel')}
            value={label}
            onChangeText={setLabel}
            placeholder={t('bookingDetail.documentLabelPlaceholder')}
            icon="file-document-outline"
          />
          {error ? <Text className="text-[13px] text-red-500">{error}</Text> : null}
          <Button
            size="lg"
            variant="secondary"
            className="w-full"
            loading={attachDocument.isPending}
            onPress={() => void handlePickAndUpload()}
          >
            {t('bookingDetail.uploadDocument')}
          </Button>
        </View>
      ) : null}
    </View>
  );
}

function DocumentRow({
  doc,
  t,
  locale,
}: {
  doc: BookingCompletionDocument;
  t: (key: string) => string;
  locale: string;
}) {
  const title = doc.label?.trim() || t('bookingDetail.defaultDocumentLabel');
  const canOpen = Boolean(doc.publicUrl);

  return (
    <Pressable
      disabled={!canOpen}
      onPress={() => {
        if (doc.publicUrl) {
          void Linking.openURL(doc.publicUrl);
        }
      }}
      className="flex-row items-center gap-3 rounded-xl border border-border bg-surface px-3 py-3"
    >
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-india-green/10">
        <AppIcon name="file-document-outline" size={18} color={Palette.indiaGreen} />
      </View>
      <View className="min-w-0 flex-1">
        <Text className="text-[14px] font-semibold text-indigo" numberOfLines={2}>
          {title}
        </Text>
        <Text className="mt-0.5 text-[12px] text-muted">{formatBookingDate(doc.uploadedAt, locale)}</Text>
      </View>
      {canOpen ? (
        <AppIcon name="link-variant" size={18} color={Palette.indiaGreen} />
      ) : (
        <AppIcon name="check-circle" size={18} color={Palette.indigo} />
      )}
    </Pressable>
  );
}
