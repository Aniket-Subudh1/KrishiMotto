import { getApiErrorMessage } from '@/lib/api-error';
import type { CropType } from '@/types/booking';

export type StorageFormValues = {
  cropType: CropType | '';
  quantityKg: string;
  query: string;
};

export type StorageFormErrors = Partial<Record<keyof StorageFormValues | 'warehouseId', string>>;

export function buildDefaultStorageForm(): StorageFormValues {
  return {
    cropType: '',
    quantityKg: '',
    query: '',
  };
}

export function parseQuantityKg(value: string): number {
  return Number.parseFloat(value.replace(/,/g, ''));
}

export function validateStorageForm(
  values: StorageFormValues,
  t: (key: string) => string,
  warehouseId: string | null,
): StorageFormErrors {
  const errors: StorageFormErrors = {};

  if (!warehouseId) {
    errors.warehouseId = t('storage.errors.warehouseRequired');
  }

  if (!values.cropType.trim()) {
    errors.cropType = t('storage.errors.cropType');
  }

  const quantity = parseQuantityKg(values.quantityKg);
  if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.quantityKg = t('storage.errors.quantityKg');
  }

  return errors;
}

export function getStorageError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
