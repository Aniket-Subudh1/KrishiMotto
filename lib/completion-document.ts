import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as LegacyFS from 'expo-file-system/legacy';
import * as WebBrowser from 'expo-web-browser';
import { Alert, Platform } from 'react-native';

import { getAssetPublicUrl, rememberAssetPublicUrl } from '@/lib/upload-url-cache';
import { buildAssetPublicUrl } from '@/lib/asset-public-url';
import type { BookingCompletionDocument } from '@/types/booking';

const ANDROID_DOWNLOADS_DIR_KEY = 'krishimotto:android-downloads-saf-uri';

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export type PickedCompletionFile = {
  uri: string;
  contentType: string;
  name?: string;
};

function defaultUploadName(contentType: string): string {
  switch (contentType) {
    case 'application/pdf':
      return 'upload.pdf';
    case 'image/png':
      return 'upload.png';
    case 'image/webp':
      return 'upload.webp';
    default:
      return 'upload.jpg';
  }
}

function guessContentType(name?: string | null, mimeType?: string | null): string | null {
  if (mimeType && ALLOWED_CONTENT_TYPES.has(mimeType)) {
    return mimeType;
  }

  const lower = name?.toLowerCase() ?? '';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  return null;
}

export function isPdfCompletionDocument(doc: Pick<BookingCompletionDocument, 'assetKey'>): boolean {
  return doc.assetKey.toLowerCase().endsWith('.pdf');
}

export function resolveCompletionDocumentUrl(
  doc: BookingCompletionDocument,
): string | undefined {
  const cached = doc.publicUrl ?? getAssetPublicUrl(doc.assetKey);
  if (cached) {
    return cached;
  }

  if (!doc.assetKey?.trim()) {
    return undefined;
  }

  return buildAssetPublicUrl(doc.assetKey);
}

export function withResolvedCompletionDocuments<T extends { completionDocuments?: BookingCompletionDocument[] }>(
  entity: T,
): T {
  if (!entity.completionDocuments?.length) {
    return entity;
  }

  return {
    ...entity,
    completionDocuments: entity.completionDocuments.map((doc) => {
      const publicUrl = resolveCompletionDocumentUrl(doc);
      if (publicUrl && doc.assetKey) {
        rememberAssetPublicUrl(doc.assetKey, publicUrl);
      }
      return {
        ...doc,
        publicUrl,
      };
    }),
  };
}

export function rememberUploadedCompletionDocument(assetKey: string, publicUrl: string): void {
  rememberAssetPublicUrl(assetKey, publicUrl);
}

export async function pickCompletionDocument(): Promise<PickedCompletionFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    type: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    multiple: false,
  });

  if (result.canceled || !result.assets?.[0]) {
    return null;
  }

  const asset = result.assets[0];
  const contentType = guessContentType(asset.name, asset.mimeType);
  if (!contentType) {
    throw new Error('Unsupported file type');
  }

  return {
    uri: asset.uri,
    contentType,
    name: asset.name,
  };
}

export async function openCompletionDocument(url: string): Promise<void> {
  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  await WebBrowser.openBrowserAsync(url);
}

async function getAndroidDownloadsDirectoryUri(): Promise<string | null> {
  const cached = await AsyncStorage.getItem(ANDROID_DOWNLOADS_DIR_KEY);
  if (cached) {
    return cached;
  }

  const initialUri = LegacyFS.StorageAccessFramework.getUriForDirectoryInRoot('Download');
  const permissions =
    await LegacyFS.StorageAccessFramework.requestDirectoryPermissionsAsync(initialUri);

  if (!permissions.granted || !permissions.directoryUri) {
    return null;
  }

  await AsyncStorage.setItem(ANDROID_DOWNLOADS_DIR_KEY, permissions.directoryUri);
  return permissions.directoryUri;
}

async function saveBytesToAndroidDownloads(
  base64: string,
  filename: string,
  mimeType: string,
): Promise<boolean> {
  const directoryUri = await getAndroidDownloadsDirectoryUri();
  if (!directoryUri) {
    return false;
  }

  const basename = filename.replace(/\.[^.]+$/, '');
  const fileUri = await LegacyFS.StorageAccessFramework.createFileAsync(
    directoryUri,
    basename,
    mimeType,
  );

  await LegacyFS.writeAsStringAsync(fileUri, base64, {
    encoding: LegacyFS.EncodingType.Base64,
  });

  return true;
}

function sanitizeFilename(label: string, extension: string): string {
  const base = label
    .trim()
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);

  return `${base || 'document'}.${extension}`;
}

export async function downloadCompletionDocument(
  doc: BookingCompletionDocument,
  label: string,
): Promise<'downloads' | 'documents'> {
  const url = resolveCompletionDocumentUrl(doc);
  if (!url) {
    throw new Error('Document URL unavailable');
  }

  const isPdf = isPdfCompletionDocument(doc);
  const assetKeyLower = doc.assetKey.toLowerCase();
  const extension = assetKeyLower.endsWith('.png')
    ? 'png'
    : assetKeyLower.endsWith('.webp')
      ? 'webp'
      : isPdf
        ? 'pdf'
        : 'jpg';
  const mimeType = extension === 'pdf'
    ? 'application/pdf'
    : extension === 'png'
      ? 'image/png'
      : extension === 'webp'
        ? 'image/webp'
        : 'image/jpeg';
  const filename = sanitizeFilename(label, extension);

  const cacheDir = LegacyFS.cacheDirectory;
  if (!cacheDir) {
    throw new Error('Cache unavailable');
  }

  const tempPath = `${cacheDir}${filename}`;
  const downloaded = await LegacyFS.downloadAsync(url, tempPath);

  if (Platform.OS === 'web') {
    const response = await fetch(url);
    const bytes = await response.arrayBuffer();
    const blob = new Blob([bytes], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(objectUrl);
    return 'downloads';
  }

  if (Platform.OS === 'android') {
    const base64 = await LegacyFS.readAsStringAsync(downloaded.uri, {
      encoding: LegacyFS.EncodingType.Base64,
    });
    const savedToDownloads = await saveBytesToAndroidDownloads(base64, filename, mimeType);
    if (savedToDownloads) {
      return 'downloads';
    }
  }

  const docsDir = new Directory(Paths.document, 'completion-documents');
  docsDir.create({ idempotent: true });
  const destFile = new File(docsDir, filename);
  if (destFile.exists) {
    destFile.delete();
  }
  new File(downloaded.uri).copy(destFile);
  return 'documents';
}

export function showCompletionDocumentDownloadAlert(
  location: 'downloads' | 'documents',
  t: (key: string) => string,
): void {
  Alert.alert(
    t('bookingDetail.downloadSuccessTitle'),
    location === 'downloads'
      ? t('bookingDetail.downloadSuccessDownloads')
      : t('bookingDetail.downloadSuccessDocuments'),
  );
}

export function uploadNameForContentType(contentType: string): string {
  return defaultUploadName(contentType);
}
