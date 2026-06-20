import { Platform } from 'react-native';

import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';

export type UploadKind = 'profile_pic' | 'kyc_certificate' | 'land_doc';

export type PresignResponse = {
  uploadUrl: string;
  assetKey: string;
  publicUrl: string;
  bucket: string;
  expiresIn: number;
  maxBytes: number;
};

function uploadViaXmlHttpRequest(uploadUrl: string, uri: string, contentType: string) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(new Error(`Failed to upload file (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Failed to upload file'));
    xhr.open('PUT', uploadUrl);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.send({ uri, type: contentType, name: 'upload.jpg' } as unknown as Blob);
  });
}

export const uploadService = {
  presign: (kind: UploadKind, contentType: string) =>
    apiClient.post<V1Response<PresignResponse>>('/uploads/presign', {
      kind,
      contentType,
    }),

  uploadToPresignedUrl: async (uploadUrl: string, uri: string, contentType: string) => {
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file (${uploadResponse.status})`);
      }

      return;
    }

    await uploadViaXmlHttpRequest(uploadUrl, uri, contentType);
  },
};
