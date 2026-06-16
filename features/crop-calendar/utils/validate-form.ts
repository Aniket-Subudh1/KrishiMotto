import { CROP_TYPES, SEASONS, type CropType, type Season } from '@/types/booking';
import { isValidIsoDate, parseLocalIsoDate } from '@/lib/date';

export type CropCalendarFormValues = {
  projectTitle: string;
  cropName: string;
  cropType: CropType;
  fieldSizeAc: string;
  season: Season;
  startDate: string;
  endDate: string;
  query: string;
};

export type CropCalendarFormErrors = Partial<Record<keyof CropCalendarFormValues, string>>;

export function validateCropCalendarForm(
  values: CropCalendarFormValues,
  t: (key: string) => string,
): CropCalendarFormErrors {
  const errors: CropCalendarFormErrors = {};

  if (values.projectTitle.trim().length < 2) {
    errors.projectTitle = t('cropCalendar.errors.projectTitle');
  }

  if (!values.cropName.trim()) {
    errors.cropName = t('cropCalendar.errors.cropName');
  }

  if (!CROP_TYPES.includes(values.cropType)) {
    errors.cropType = t('cropCalendar.errors.cropType');
  }

  const fieldSize = Number.parseFloat(values.fieldSizeAc);
  if (!Number.isFinite(fieldSize) || fieldSize <= 0) {
    errors.fieldSizeAc = t('cropCalendar.errors.fieldSizeAc');
  }

  if (!SEASONS.includes(values.season)) {
    errors.season = t('cropCalendar.errors.season');
  }

  if (!isValidIsoDate(values.startDate)) {
    errors.startDate = t('cropCalendar.errors.startDate');
  }

  if (!isValidIsoDate(values.endDate)) {
    errors.endDate = t('cropCalendar.errors.endDate');
  } else if (
    isValidIsoDate(values.startDate) &&
    parseLocalIsoDate(values.endDate) <= parseLocalIsoDate(values.startDate)
  ) {
    errors.endDate = t('cropCalendar.errors.endBeforeStart');
  }

  return errors;
}

export function parseFieldSizeAc(value: string): number {
  return Number.parseFloat(value);
}
