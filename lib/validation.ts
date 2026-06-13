export const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;

export function normalizePhoneInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10);
}

export function isValidIndianPhone(phone: string): boolean {
  return INDIAN_PHONE_REGEX.test(phone);
}

export function isValidUsername(username: string): boolean {
  const trimmed = username.trim();
  return trimmed.length >= 2 && trimmed.length <= 100;
}

export function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

export function isValidProfileName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 1 && trimmed.length <= 120;
}

export function isValidLocationField(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 80;
}

export function isValidExpertField(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 1 && trimmed.length <= 120;
}

export function isValidCrop(value: string): boolean {
  return value.trim().length <= 80;
}

export function isValidSeason(value: string): boolean {
  return value.trim().length <= 40;
}

export function isValidEmail(email: string): boolean {
  const trimmed = email.trim();
  return trimmed.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function isValidPincode(pincode: string): boolean {
  return /^\d{6}$/.test(pincode.trim());
}

export function isValidYearsExperience(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 60;
}

export function parseCommaSeparatedList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parsePincodeList(value: string): string[] {
  return parseCommaSeparatedList(value).filter((item) => /^\d{6}$/.test(item));
}

export const INDIAN_CROP_SEASONS = ['Kharif', 'Rabi', 'Zaid'] as const;
export type CropSeason = (typeof INDIAN_CROP_SEASONS)[number];
