import {
  CREDIT_PURPOSES,
  type CreditPurpose,
} from '@/types/booking';
import type { BankDetails } from '@/types/credit';

export type PpacsCreditFormValues = {
  aadhaarNumber: string;
  fullName: string;
  smartContractId: string;
  lenderId: string;
  loanAmountRupee: string;
  tenureMonths: string;
  maxInterestPa: string;
  purpose: CreditPurpose;
  collateralQuantityKg: string;
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
};

export type PpacsCreditFormErrors = Partial<Record<keyof PpacsCreditFormValues, string>>;

const MIN_LOAN_RUPEES = 10_000;
const MAX_LOAN_RUPEES = 50_00_000;
const MIN_TENURE_DAYS = 30;
const MAX_TENURE_DAYS = 3650;

export function buildDefaultPpacsCreditForm(fullName = ''): PpacsCreditFormValues {
  return {
    aadhaarNumber: '',
    fullName,
    smartContractId: '',
    lenderId: '',
    loanAmountRupee: '',
    tenureMonths: '12',
    maxInterestPa: '12',
    purpose: 'Inputs',
    collateralQuantityKg: '',
    accountHolder: fullName,
    accountNumber: '',
    ifsc: '',
    bankName: '',
  };
}

export function parseLoanAmountRupees(value: string): number {
  return Number.parseFloat(value.replace(/,/g, ''));
}

export function parseTenureDays(value: string): number {
  const months = Number.parseFloat(value);
  if (!Number.isFinite(months)) return NaN;
  return Math.round(months * 30);
}

export function parseMaxInterestPa(value: string): number {
  return Number.parseFloat(value);
}

export function parseCollateralQuantityKg(value: string): number {
  const kg = Number.parseFloat(value.trim());
  return Number.isFinite(kg) ? kg : NaN;
}

function validateAadhaar(value: string, t: (key: string) => string): string | undefined {
  if (!/^\d{4}\s?-?\d{4}\s?-?\d{4}$/.test(value.trim())) {
    return t('ppacsCredit.errors.aadhaar');
  }
  return undefined;
}

function validateBankDetails(
  values: Pick<PpacsCreditFormValues, 'accountHolder' | 'accountNumber' | 'ifsc' | 'bankName'>,
  t: (key: string) => string,
): PpacsCreditFormErrors {
  const errors: PpacsCreditFormErrors = {};

  if (values.accountHolder.trim().length < 2) {
    errors.accountHolder = t('ppacsCredit.errors.accountHolder');
  }

  if (!/^\d{9,18}$/.test(values.accountNumber.replace(/\s/g, ''))) {
    errors.accountNumber = t('ppacsCredit.errors.accountNumber');
  }

  if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(values.ifsc.trim())) {
    errors.ifsc = t('ppacsCredit.errors.ifsc');
  }

  if (values.bankName.trim().length < 2) {
    errors.bankName = t('ppacsCredit.errors.bankName');
  }

  return errors;
}

export function validateKycStep(
  values: Pick<PpacsCreditFormValues, 'aadhaarNumber' | 'fullName'>,
  t: (key: string) => string,
): PpacsCreditFormErrors {
  const errors: PpacsCreditFormErrors = {};
  const aadhaarError = validateAadhaar(values.aadhaarNumber, t);
  if (aadhaarError) errors.aadhaarNumber = aadhaarError;
  if (values.fullName.trim().length < 2) {
    errors.fullName = t('ppacsCredit.errors.fullName');
  }
  return errors;
}

export function validateReceiptStep(
  values: Pick<PpacsCreditFormValues, 'smartContractId' | 'collateralQuantityKg'>,
  freeQuantityKg: number | null,
  t: (key: string) => string,
): PpacsCreditFormErrors {
  const errors: PpacsCreditFormErrors = {};

  if (!values.smartContractId) {
    errors.smartContractId = t('ppacsCredit.errors.smartContract');
  }

  const collateralKg = parseCollateralQuantityKg(values.collateralQuantityKg);
  if (!Number.isFinite(collateralKg) || collateralKg <= 0) {
    errors.collateralQuantityKg = t('ppacsCredit.errors.collateralRequired');
  } else if (freeQuantityKg != null && collateralKg > freeQuantityKg) {
    errors.collateralQuantityKg = t('ppacsCredit.errors.collateralExceedsFree')
      .replace('{{free}}', String(freeQuantityKg));
  }

  return errors;
}

export function validateLenderStep(
  values: Pick<PpacsCreditFormValues, 'lenderId'>,
  t: (key: string) => string,
): PpacsCreditFormErrors {
  if (!values.lenderId) {
    return { lenderId: t('ppacsCredit.errors.lender') };
  }
  return {};
}

export function validateTermsStep(
  values: Pick<PpacsCreditFormValues, 'loanAmountRupee' | 'tenureMonths' | 'maxInterestPa' | 'purpose'>,
  t: (key: string) => string,
): PpacsCreditFormErrors {
  const errors: PpacsCreditFormErrors = {};

  const loanAmountRupees = parseLoanAmountRupees(values.loanAmountRupee);
  if (!Number.isFinite(loanAmountRupees) || loanAmountRupees < MIN_LOAN_RUPEES) {
    errors.loanAmountRupee = t('ppacsCredit.errors.loanAmountMin');
  } else if (loanAmountRupees > MAX_LOAN_RUPEES) {
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

  return errors;
}

export function validateBankStep(
  values: Pick<PpacsCreditFormValues, 'accountHolder' | 'accountNumber' | 'ifsc' | 'bankName'>,
  t: (key: string) => string,
): PpacsCreditFormErrors {
  return validateBankDetails(values, t);
}

export function validatePpacsCreditForm(
  values: PpacsCreditFormValues,
  freeQuantityKg: number | null,
  t: (key: string) => string,
  options?: { skipKyc?: boolean },
): PpacsCreditFormErrors {
  return {
    ...(options?.skipKyc ? {} : validateKycStep(values, t)),
    ...validateReceiptStep(values, freeQuantityKg, t),
    ...validateLenderStep(values, t),
    ...validateTermsStep(values, t),
    ...validateBankStep(values, t),
  };
}

export function toApplyAgriCreditPayload(values: PpacsCreditFormValues) {
  const bankDetails: BankDetails = {
    accountHolder: values.accountHolder.trim(),
    accountNumber: values.accountNumber.replace(/\s/g, ''),
    ifsc: values.ifsc.trim().toUpperCase(),
    bankName: values.bankName.trim(),
  };

  return {
    smartContractId: values.smartContractId,
    lenderId: values.lenderId,
    collateralQuantityKg: parseCollateralQuantityKg(values.collateralQuantityKg),
    requestedAmountRupees: parseLoanAmountRupees(values.loanAmountRupee),
    tenureDays: parseTenureDays(values.tenureMonths),
    maxInterestRatePa: parseMaxInterestPa(values.maxInterestPa),
    purpose: values.purpose,
    bankDetails,
  };
}

export function toKycPayload(values: Pick<PpacsCreditFormValues, 'aadhaarNumber' | 'fullName'>) {
  return {
    aadhaarNumber: values.aadhaarNumber.trim(),
    fullName: values.fullName.trim(),
  };
}
