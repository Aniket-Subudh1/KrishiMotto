import { CROP_TYPES, SOIL_TYPES, type CropType, type SoilType } from '@/types/booking';

export type SoilHealthFormValues = {
  cropType: CropType;
  soilType: SoilType;
  transportIncluded: boolean;
  query: string;
};

export type SoilHealthFormErrors = Partial<Record<keyof SoilHealthFormValues, string>>;

export function buildDefaultSoilHealthForm(): SoilHealthFormValues {
  return {
    cropType: 'Cereal',
    soilType: 'Loamy',
    transportIncluded: true,
    query: '',
  };
}

export function validateSoilHealthForm(
  values: SoilHealthFormValues,
  t: (key: string) => string,
): SoilHealthFormErrors {
  const errors: SoilHealthFormErrors = {};

  if (!CROP_TYPES.includes(values.cropType)) {
    errors.cropType = t('soilHealth.errors.cropType');
  }

  if (!SOIL_TYPES.includes(values.soilType)) {
    errors.soilType = t('soilHealth.errors.soilType');
  }

  return errors;
}
