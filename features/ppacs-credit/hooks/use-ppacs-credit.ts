import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { isActiveLoan } from '@/features/ppacs-credit/utils/loan-display';
import { getApiErrorMessage, isNotFoundError } from '@/lib/api-error';
import { FARMER_DATA_POLL_INTERVAL_MS, invalidateFarmerServiceQueries } from '@/lib/query-cache-sync';
import { useFarmerSmartContracts } from '@/features/smart-contracts/hooks/use-smart-contracts';
import { farmerKycService } from '@/services/farmer-kyc.service';
import { lenderService } from '@/services/lender.service';
import { loanService } from '@/services/loan.service';
import type { ApplyAgriCreditPayload, SubmitFarmerKycPayload } from '@/types/credit';

export { useFarmerSmartContracts };

export const CREDIT_KEYS = {
  lenders: ['credit', 'lenders'] as const,
  kyc: ['credit', 'farmer-kyc'] as const,
  loans: ['credit', 'loans'] as const,
  loan: (id: string) => ['credit', 'loans', id] as const,
  loanTrack: (id: string) => ['credit', 'loans', id, 'track'] as const,
};

export function getCreditError(error: unknown, fallback: string): string {
  return getApiErrorMessage(error, fallback);
}

export function usePublicLenders() {
  return useQuery({
    queryKey: CREDIT_KEYS.lenders,
    queryFn: async () => {
      const { data } = await lenderService.listPublic();
      return data.data.items;
    },
    staleTime: 5 * 60_000,
  });
}

export function useFarmerKyc() {
  return useQuery({
    queryKey: CREDIT_KEYS.kyc,
    queryFn: async () => {
      try {
        const { data } = await farmerKycService.get();
        return data.data;
      } catch (error) {
        if (isNotFoundError(error)) return null;
        throw error;
      }
    },
  });
}

export function useSubmitFarmerKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SubmitFarmerKycPayload) => {
      const { data } = await farmerKycService.submit(payload);
      return data.data;
    },
    onSuccess: (kyc) => {
      queryClient.setQueryData(CREDIT_KEYS.kyc, kyc);
    },
  });
}

export function useFarmerLoans(options?: { poll?: boolean }) {
  return useQuery({
    queryKey: CREDIT_KEYS.loans,
    queryFn: async () => {
      const { data } = await loanService.listForFarmer();
      return data.data.items;
    },
    refetchInterval: options?.poll ? FARMER_DATA_POLL_INTERVAL_MS : false,
  });
}

export function useApplyAgriCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ApplyAgriCreditPayload) => {
      const { data } = await loanService.applyAgriCredit(payload);
      return data.data;
    },
    onSuccess: (loan) => {
      queryClient.setQueryData(CREDIT_KEYS.loan(loan.id), loan);
      void invalidateFarmerServiceQueries(queryClient);
    },
  });
}

export function useLoanTrack(loanId: string | null, options?: { poll?: boolean }) {
  return useQuery({
    queryKey: CREDIT_KEYS.loanTrack(loanId ?? ''),
    enabled: Boolean(loanId),
    queryFn: async () => {
      const { data } = await loanService.trackForFarmer(loanId!);
      return data.data;
    },
    refetchOnMount: 'always',
    refetchInterval: (query) => {
      if (!options?.poll) {
        return false;
      }

      const track = query.state.data;
      if (!track || !isActiveLoan(track.loan)) {
        return false;
      }

      return FARMER_DATA_POLL_INTERVAL_MS;
    },
  });
}
