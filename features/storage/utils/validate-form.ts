import { getApiErrorMessage } from '@/lib/api-error';
import type { CropType } from '@/types/booking';

export type StorageFormValues = {
  cropType: CropType | '';
  quantityKg: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
  query: string;
};

export type StorageFormErrors = Partial<Record<keyof StorageFormValues | 'warehouseId', string>>;

const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/i;

export function buildDefaultStorageForm(): StorageFormValues {
  return {
    cropType: '',
    quantityKg: '',
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
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

  if (values.accountHolder.trim().length < 2) {
    errors.accountHolder = t('storage.errors.accountHolder');
  }

  if (values.accountNumber.trim().length < 6) {
    errors.accountNumber = t('storage.errors.accountNumber');
  }

  const ifsc = values.ifsc.trim().toUpperCase();
  if (!IFSC_PATTERN.test(ifsc)) {
    errors.ifsc = t('storage.errors.ifsc');
  }

  if (values.bankName.trim().length < 2) {
    errors.bankName = t('storage.errors.bankName');
  }

  return errors;
}

export function getStorageError(error: unknown, fallback: string) {
  return getApiErrorMessage(error, fallback);
}
