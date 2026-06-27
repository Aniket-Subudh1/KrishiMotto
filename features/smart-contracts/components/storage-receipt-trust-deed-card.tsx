import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import { AppIcon } from '@/components/ui/app-icon';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import {
  copyTrustDeedUrl,
  downloadTrustDeedPdf,
  openTrustDeedUrl,
  shareTrustDeedUrl,
  showTrustDeedDownloadAlert,
  showTrustDeedDownloadErrorAlert,
  type TrustDeedPdfInput,
} from '@/lib/trust-deed';

type StorageReceiptTrustDeedCardProps = TrustDeedPdfInput & {
  t: (key: string, options?: Record<string, unknown>) => string;
};

export function StorageReceiptTrustDeedCard({
  qrId,
  publicReceiptUrl,
  warehouseName,
  cropType,
  depositorName,
  contractNumber,
  receiptId,
  quantityKg,
  valuationLabel,
  t,
}: StorageReceiptTrustDeedCardProps) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDownloadPdf() {
    setDownloading(true);
    try {
      const result = await downloadTrustDeedPdf({
        qrId,
        publicReceiptUrl,
        warehouseName,
        cropType,
        depositorName,
        contractNumber,
        receiptId,
        quantityKg,
        valuationLabel,
      });
      showTrustDeedDownloadAlert(result, t);
    } catch {
      showTrustDeedDownloadErrorAlert(t);
    } finally {
      setDownloading(false);
    }
  }

  async function handleCopyUrl() {
    await copyTrustDeedUrl(publicReceiptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View className="overflow-hidden rounded-2xl border border-emerald-800/20 bg-[#0f3328]">
      <View className="border-b border-white/10 px-4 py-3">
        <View className="flex-row items-center gap-2">
          <AppIcon name="qrcode" size={16} color="#E9AF43" />
          <Text className="text-[11px] font-semibold uppercase tracking-widest text-[#E9AF43]">
            {t('smartContracts.trustDeedTitle')}
          </Text>
        </View>
        {warehouseName ? (
          <Text className="mt-1.5 text-[14px] font-medium text-emerald-100">{warehouseName}</Text>
        ) : null}
      </View>

      <View className="items-center gap-4 px-4 py-5">
        <View className="rounded-2xl bg-white p-4">
          <QRCode value={publicReceiptUrl} size={180} color="#0a2e24" backgroundColor="#ffffff" />
        </View>

        <View className="w-full rounded-xl bg-black/25 px-3 py-3">
          <Text className="text-[10px] font-medium uppercase tracking-wider text-emerald-200/60">
            {t('smartContracts.trustDeedVerificationUrl')}
          </Text>
          <Pressable
            onPress={() => void openTrustDeedUrl(publicReceiptUrl)}
            className="mt-2 flex-row items-start gap-2"
            accessibilityRole="link"
          >
            <Text className="flex-1 text-[12px] leading-5 text-[#E9AF43]" selectable>
              {publicReceiptUrl}
            </Text>
            <AppIcon name="open-in-new" size={16} color="#E9AF43" />
          </Pressable>
          <Text className="mt-2 font-mono text-[11px] text-emerald-100/85">
            {t('smartContracts.trustDeedId', { id: qrId })}
          </Text>
          {cropType ? (
            <Text className="mt-1 text-[12px] text-emerald-100/90">{cropType}</Text>
          ) : null}
        </View>

        <View className="w-full flex-row gap-2">
          <Button
            size="md"
            variant="secondary"
            className="flex-1 bg-white/95"
            onPress={() => void handleCopyUrl()}
          >
            {copied ? t('smartContracts.trustDeedCopied') : t('smartContracts.trustDeedCopyUrl')}
          </Button>
          <Button
            size="md"
            variant="secondary"
            className="flex-1 bg-white/95"
            onPress={() => void shareTrustDeedUrl(publicReceiptUrl, t('smartContracts.trustDeedShareTitle'))}
          >
            {t('smartContracts.trustDeedShare')}
          </Button>
        </View>

        <Button
          size="md"
          className="w-full bg-[#E9AF43]"
          onPress={() => void handleDownloadPdf()}
          disabled={downloading}
        >
          {downloading ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color={Palette.indigo} />
              <Text className="text-[14px] font-semibold text-indigo">
                {t('smartContracts.trustDeedDownloading')}
              </Text>
            </View>
          ) : (
            t('smartContracts.trustDeedDownloadPdf')
          )}
        </Button>

        <Pressable
          onPress={() => void Linking.openURL(publicReceiptUrl)}
          className="flex-row items-center gap-1.5"
        >
          <AppIcon name="web" size={14} color="#7dd3a8" />
          <Text className="text-[12px] font-semibold text-[#7dd3a8]">
            {t('smartContracts.trustDeedOpenBrowser')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
