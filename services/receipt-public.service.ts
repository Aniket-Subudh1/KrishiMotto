import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type { PublicStorageReceipt } from '@/types/receipt';

export const receiptPublicService = {
  get: (qrId: string) =>
    apiClient.get<V1Response<PublicStorageReceipt>>(`/public/receipts/${qrId}`, {
      skipAuthRefresh: true,
    }),
};
