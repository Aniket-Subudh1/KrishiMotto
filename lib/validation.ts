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

export function isValidCrop(value: string): boolean {
  return value.trim().length <= 80;
}
