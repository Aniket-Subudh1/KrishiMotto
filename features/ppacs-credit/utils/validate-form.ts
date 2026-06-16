import {
  CREDIT_PURPOSES,
  type CreditPurpose,
} from '@/types/booking';

export type PpacsCreditFormValues = {
  loanAmountRupee: string;
  tenureMonths: string;
  maxInterestPa: string;
  purpose: CreditPurpose;
  commodity: string;
  quantityKg: string;
  grade: string;
  query: string;
};

export type PpacsCreditFormErrors = Partial<Record<keyof PpacsCreditFormValues, string>>;

const MIN_LOAN_PAISE = 10_000_00;
const MAX_LOAN_PAISE = 50_00_000_00;
const MIN_TENURE_DAYS = 30;
const MAX_TENURE_DAYS = 3650;

export function buildDefaultPpacsCreditForm(): PpacsCreditFormValues {
  return {
    loanAmountRupee: '',
    tenureMonths: '12',
    maxInterestPa: '12',
    purpose: 'Inputs',
    commodity: '',
    quantityKg: '',
    grade: '',
    query: '',
  };
}

export function parseLoanAmountPaise(value: string): number {
  const rupees = Number.parseFloat(value.replace(/,/g, ''));
  if (!Number.isFinite(rupees)) return NaN;
  return Math.round(rupees * 100);
}

export function parseTenureDays(value: string): number {
  const months = Number.parseFloat(value);
  if (!Number.isFinite(months)) return NaN;
  return Math.round(months * 30);
}

export function parseMaxInterestPa(value: string): number {
  return Number.parseFloat(value);
}

export function parseQuantityKg(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const kg = Number.parseFloat(trimmed);
  return Number.isFinite(kg) && kg > 0 ? kg : NaN;
}

export function validatePpacsCreditForm(
  values: PpacsCreditFormValues,
  t: (key: string) => string,
): PpacsCreditFormErrors {
  const errors: PpacsCreditFormErrors = {};

  const loanAmountPaise = parseLoanAmountPaise(values.loanAmountRupee);
  if (!Number.isFinite(loanAmountPaise) || loanAmountPaise < MIN_LOAN_PAISE) {
    errors.loanAmountRupee = t('ppacsCredit.errors.loanAmountMin');
  } else if (loanAmountPaise > MAX_LOAN_PAISE) {
    errors.loanAmountRupee = t('ppacsCredit.errors.loanAmountMax');
  }

  const tenureDays = parseTenureDays(values.tenureMonths);
  if (!Number.isFinite(tenureDays) || tenureDays < MIN_TENURE_DAYS || tenureDays > MAX_TENURE_DAYS) {
    errors.tenureMonths = t('ppacsCredit.errors.tenure');
  }

  const maxInterestPa = parseMaxInterestPa(values.maxInterestPa);
  if (!Number.isFinite(maxInterestPa) || maxInterestPa < 0 || maxInterestPa > 100) {
    errors.maxInterestPa = t('ppacsCredit.errors.maxInterest');
  }

  if (!CREDIT_PURPOSES.includes(values.purpose)) {
    errors.purpose = t('ppacsCredit.errors.purpose');
  }

  const quantityKg = parseQuantityKg(values.quantityKg);
  if (values.quantityKg.trim() && !Number.isFinite(quantityKg)) {
    errors.quantityKg = t('ppacsCredit.errors.quantityKg');
  }

  if (values.commodity.trim() && values.commodity.trim().length > 64) {
    errors.commodity = t('ppacsCredit.errors.commodity');
  }

  if (values.grade.trim() && values.grade.trim().length > 32) {
    errors.grade = t('ppacsCredit.errors.grade');
  }

  return errors;
}

export function toPpacsCreditDetails(values: PpacsCreditFormValues) {
  const loanAmountPaise = parseLoanAmountPaise(values.loanAmountRupee);
  const tenureDays = parseTenureDays(values.tenureMonths);
  const maxInterestPa = parseMaxInterestPa(values.maxInterestPa);
  const quantityKg = parseQuantityKg(values.quantityKg);

  return {
    loanAmountPaise,
    tenureDays,
    maxInterestPa,
    purpose: values.purpose,
    ...(values.commodity.trim() ? { commodity: values.commodity.trim() } : {}),
    ...(Number.isFinite(quantityKg) ? { quantityKg } : {}),
    ...(values.grade.trim() ? { grade: values.grade.trim() } : {}),
  };
}
