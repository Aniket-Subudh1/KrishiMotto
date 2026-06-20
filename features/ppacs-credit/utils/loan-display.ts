import type { Href } from 'expo-router';

import type { Loan, LoanStatus } from '@/types/credit';
import { Palette } from '@/constants/theme';

export function isActiveLoan(loan: Loan): boolean {
  return loan.status !== 'REPAID' && loan.status !== 'REJECTED';
}

export function getLoanTrackRoute(loanId: string): Href {
  return `/services/ppacs-credit/track/${loanId}` as Href;
}

export function getLoanStatusColor(status: LoanStatus): string {
  switch (status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return '#F59E0B';
    case 'APPROVED':
      return Palette.indigo;
    case 'DISBURSED':
    case 'REPAID':
      return Palette.indiaGreen;
    case 'REJECTED':
      return '#EF4444';
    default:
      return Palette.indigo;
  }
}

export function translateLoanStatus(t: (key: string) => string, status: LoanStatus): string {
  return t(`ppacsCredit.loanStatuses.${status}`);
}

export function formatLoanCollateral(contract: {
  cropType: string;
  freeQuantityKg: number;
  contractNumber: string;
}): string {
  return `${contract.cropType} · ${contract.freeQuantityKg.toLocaleString('en-IN')} kg free · ${contract.contractNumber}`;
}
