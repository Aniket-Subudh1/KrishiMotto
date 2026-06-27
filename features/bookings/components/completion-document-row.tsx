import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatBookingDate } from '@/features/home/utils/booking-display';
import {
  downloadCompletionDocument,
  isPdfCompletionDocument,
  openCompletionDocument,
  resolveCompletionDocumentUrl,
  showCompletionDocumentDownloadAlert,
} from '@/lib/completion-document';
import { Palette } from '@/constants/theme';
import type { BookingCompletionDocument } from '@/types/booking';

type CompletionDocumentRowProps = {
  doc: BookingCompletionDocument;
  t: (key: string) => string;
  locale: string;
  defaultLabel?: string;
};

export function CompletionDocumentRow({ doc, t, locale, defaultLabel }: CompletionDocumentRowProps) {
  const [downloading, setDownloading] = useState(false);
  const title = doc.label?.trim() || defaultLabel || t('bookingDetail.defaultDocumentLabel');
  const url = resolveCompletionDocumentUrl(doc);
  const isPdf = isPdfCompletionDocument(doc);

  async function handleOpen() {
    if (!url) return;
    try {
      await openCompletionDocument(url);
    } catch {
      Alert.alert(t('bookingDetail.documentUnavailable'));
    }
  }

  async function handleDownload() {
    if (!url) return;
    setDownloading(true);
    try {
      const location = await downloadCompletionDocument(doc, title);
      showCompletionDocumentDownloadAlert(location, t);
    } catch {
      Alert.alert(t('bookingDetail.downloadError'));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <View className="rounded-xl border border-border bg-surface px-3 py-3">
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-india-green/10">
          <AppIcon
            name={isPdf ? 'file-pdf-box' : 'file-image-outline'}
            size={18}
            color={Palette.indiaGreen}
          />
        </View>
        <View className="min-w-0 flex-1">
          <Text className="text-[14px] font-semibold text-indigo" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-0.5 text-[12px] text-muted">{formatBookingDate(doc.uploadedAt, locale)}</Text>
        </View>
      </View>

      {url ? (
        <View className="mt-3 flex-row gap-2">
          <Button size="sm" variant="secondary" className="flex-1" onPress={() => void handleOpen()}>
            {t('bookingDetail.viewDocument')}
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onPress={() => void handleDownload()}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              t('bookingDetail.downloadDocument')
            )}
          </Button>
        </View>
      ) : (
        <Pressable disabled className="mt-3 rounded-lg bg-white px-3 py-2">
          <Text className="text-center text-[12px] text-muted">{t('bookingDetail.documentUnavailable')}</Text>
        </Pressable>
      )}
    </View>
  );
}
