import { CROP_TYPES, type CropType } from '@/types/booking';
import { isValidIsoDate, parseLocalIsoDate, toLocalIsoDate } from '@/lib/date';

export type DroneSprayFormValues = {
  cropType: CropType;
  sprayDate: string;
  query: string;
};

export type DroneSprayFormErrors = Partial<Record<keyof DroneSprayFormValues, string>>;

function defaultSprayDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 2);
  return toLocalIsoDate(date);
}

export function buildDefaultDroneSprayForm(primaryCropType?: CropType | null): DroneSprayFormValues {
  return {
    cropType: primaryCropType && CROP_TYPES.includes(primaryCropType) ? primaryCropType : 'Cereal',
    sprayDate: defaultSprayDate(),
    query: '',
  };
}

export function validateDroneSprayForm(
  values: DroneSprayFormValues,
  t: (key: string) => string,
): DroneSprayFormErrors {
  const errors: DroneSprayFormErrors = {};

  if (!CROP_TYPES.includes(values.cropType)) {
    errors.cropType = t('droneSpray.errors.cropType');
  }

  if (!isValidIsoDate(values.sprayDate)) {
    errors.sprayDate = t('droneSpray.errors.sprayDate');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parseLocalIsoDate(values.sprayDate) < today) {
      errors.sprayDate = t('droneSpray.errors.sprayDatePast');
    }
  }

  return errors;
}
