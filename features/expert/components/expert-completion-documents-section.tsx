import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { CompletionDocumentRow } from '@/features/bookings/components/completion-document-row';
import {
  getExpertOrderError,
  useAttachExpertOrderDocument,
} from '@/features/expert/hooks/use-expert-orders';
import { canExpertUploadDocument } from '@/features/expert/utils/expert-order-display';
import { useAppLocale } from '@/hooks/use-app-locale';
import { pickCompletionDocument } from '@/lib/completion-document';
import type { ExpertBooking } from '@/types/expert-booking';

type ExpertCompletionDocumentsSectionProps = {
  order: ExpertBooking;
  t: (key: string) => string;
};

export function ExpertCompletionDocumentsSection({
  order,
  t,
}: ExpertCompletionDocumentsSectionProps) {
  const { locale } = useAppLocale();
  const isCropCalendar = order.serviceIconType === 'CROP_CALENDAR';
  const [label, setLabel] = useState('');
  const [error, setError] = useState<string | null>(null);
  const attachDocument = useAttachExpertOrderDocument(order.id);
  const documents = order.completionDocuments ?? [];
  const canUpload = canExpertUploadDocument(order.bookingStatus);
  const defaultLabel = isCropCalendar
    ? t('bookingDetail.cropCalendarDefaultLabel')
    : t('bookingDetail.defaultDocumentLabel');
  const documentsHint = isCropCalendar
    ? t('expertDashboard.orderDetail.cropCalendarDocumentsHint')
    : t('expertDashboard.orderDetail.documentsHint');
  const labelPlaceholder = isCropCalendar
    ? t('bookingDetail.cropCalendarLabelPlaceholder')
    : t('bookingDetail.documentLabelPlaceholder');

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
        label: label.trim() || defaultLabel,
      });
      setLabel('');
    } catch (uploadError) {
      setError(getExpertOrderError(uploadError, t('bookingDetail.uploadError')));
    }
  }

  return (
    <View className="rounded-2xl border border-border bg-white p-4">
      <Text className="text-[13px] font-semibold uppercase tracking-wide text-muted">
        {t('bookingDetail.documentsTitle')}
      </Text>
      <Text className="mt-1 text-[13px] leading-5 text-muted">
        {canUpload ? documentsHint : t('bookingDetail.documentsHintLocked')}
      </Text>

      {documents.length > 0 ? (
        <View className="mt-4 gap-2">
          {documents.map((doc) => (
            <CompletionDocumentRow
              key={`${doc.assetKey}-${doc.uploadedAt}`}
              doc={doc}
              t={t}
              locale={locale}
            />
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
            placeholder={labelPlaceholder}
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
