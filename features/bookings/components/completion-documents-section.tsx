import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { CompletionDocumentRow } from '@/features/bookings/components/completion-document-row';
import {
  getBookingError,
  useAttachCompletionDocument,
} from '@/features/bookings/hooks/use-booking';
import { canFarmerUploadCompletionDocument } from '@/features/bookings/utils/booking-progress';
import { useAppLocale } from '@/hooks/use-app-locale';
import { pickCompletionDocument } from '@/lib/completion-document';
import type { Booking } from '@/types/booking';

type CompletionDocumentsSectionProps = {
  booking: Booking;
  t: (key: string) => string;
};

export function CompletionDocumentsSection({ booking, t }: CompletionDocumentsSectionProps) {
  const { locale } = useAppLocale();
  const isCropCalendar = booking.serviceIconType === 'CROP_CALENDAR';
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const attachDocument = useAttachCompletionDocument(booking.id);
  const documents = booking.completionDocuments ?? [];
  const canUpload = canFarmerUploadCompletionDocument(
    booking.bookingStatus,
    booking.serviceIconType,
  );

  const sectionTitle = isCropCalendar
    ? t('bookingDetail.cropCalendarDocumentsTitle')
    : t('bookingDetail.documentsTitle');

  const sectionHint = isCropCalendar
    ? t('bookingDetail.cropCalendarDocumentsHint')
    : canUpload
      ? t('bookingDetail.documentsHint')
      : t('bookingDetail.documentsHintLocked');

  const emptyMessage = isCropCalendar
    ? t('bookingDetail.cropCalendarNoDocuments')
    : t('bookingDetail.noDocuments');

  async function handlePickAndUpload() {
    setError(null);

    try {
      const picked = await pickCompletionDocument();
      if (!picked) {
        return;
      }

      await attachDocument.mutateAsync({
        uri: picked.uri,
        contentType: picked.contentType,
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
        {sectionTitle}
      </Text>
      <Text className="mt-1 text-[13px] leading-5 text-muted">{sectionHint}</Text>

      {documents.length > 0 ? (
        <View className="mt-4 gap-2">
          {documents.map((doc) => (
            <CompletionDocumentRow
              key={`${doc.assetKey}-${doc.uploadedAt}`}
              doc={doc}
              t={t}
              locale={locale}
              defaultLabel={
                isCropCalendar
                  ? t('bookingDetail.cropCalendarDefaultLabel')
                  : t('bookingDetail.defaultDocumentLabel')
              }
            />
          ))}
        </View>
      ) : (
        <View className="mt-4 rounded-xl border border-dashed border-border bg-surface px-4 py-5">
          <Text className="text-center text-[13px] leading-5 text-muted">{emptyMessage}</Text>
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
