import {
  CROP_TYPES,
  SOIL_TYPES,
  VISIT_PURPOSES,
  type CropType,
  type SoilType,
  type VisitPurpose,
} from '@/types/booking';
import { isValidIsoDate, parseLocalIsoDate, toLocalIsoDate } from '@/lib/date';

export type ExpertVisitFormValues = {
  visitPurpose: VisitPurpose;
  cropType: CropType;
  soilType: SoilType;
  areaAc: string;
  preferredDate: string;
  query: string;
};

export type ExpertVisitFormErrors = Partial<Record<keyof ExpertVisitFormValues, string>>;

function defaultPreferredDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return toLocalIsoDate(date);
}

export function buildDefaultExpertVisitForm(): ExpertVisitFormValues {
  return {
    visitPurpose: 'Advisory',
    cropType: 'Cereal',
    soilType: 'Loamy',
    areaAc: '',
    preferredDate: defaultPreferredDate(),
    query: '',
  };
}

export function parseAreaAc(value: string): number {
  return Number.parseFloat(value);
}

export function validateExpertVisitForm(
  values: ExpertVisitFormValues,
  t: (key: string) => string,
): ExpertVisitFormErrors {
  const errors: ExpertVisitFormErrors = {};

  if (!VISIT_PURPOSES.includes(values.visitPurpose)) {
    errors.visitPurpose = t('expertVisit.errors.visitPurpose');
  }

  if (!CROP_TYPES.includes(values.cropType)) {
    errors.cropType = t('expertVisit.errors.cropType');
  }

  if (!SOIL_TYPES.includes(values.soilType)) {
    errors.soilType = t('expertVisit.errors.soilType');
  }

  const area = parseAreaAc(values.areaAc);
  if (!Number.isFinite(area) || area <= 0) {
    errors.areaAc = t('expertVisit.errors.areaAc');
  }

  if (!isValidIsoDate(values.preferredDate)) {
    errors.preferredDate = t('expertVisit.errors.preferredDate');
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parseLocalIsoDate(values.preferredDate) < today) {
      errors.preferredDate = t('expertVisit.errors.preferredDatePast');
    }
  }

  return errors;
}
