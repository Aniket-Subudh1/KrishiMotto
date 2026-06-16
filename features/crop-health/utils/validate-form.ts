import { CROP_TYPES, SOIL_TYPES, type CropType, type SoilType } from '@/types/booking';

export type CropHealthFormValues = {
  cropType: CropType;
  soilType: SoilType;
  transportIncluded: boolean;
  query: string;
};

export type CropHealthFormErrors = Partial<Record<keyof CropHealthFormValues, string>>;

export function buildDefaultCropHealthForm(): CropHealthFormValues {
  return {
    cropType: 'Cereal',
    soilType: 'Loamy',
    transportIncluded: true,
    query: '',
  };
}

export function validateCropHealthForm(
  values: CropHealthFormValues,
  t: (key: string) => string,
): CropHealthFormErrors {
  const errors: CropHealthFormErrors = {};

  if (!CROP_TYPES.includes(values.cropType)) {
    errors.cropType = t('cropHealth.errors.cropType');
  }

  if (!SOIL_TYPES.includes(values.soilType)) {
    errors.soilType = t('cropHealth.errors.soilType');
  }

  return errors;
}
