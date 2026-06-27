import { useAssignedExpert } from '@/features/bookings/hooks/use-assigned-expert';
import { getExpertDisplayName, looksLikeOpaqueId } from '@/lib/assigned-expert-display';

type ResolvedAssignedExpertInput = {
  expertId?: string | null;
  expertName?: string | null;
};

export function useResolvedAssignedExpert({
  expertId,
  expertName,
}: ResolvedAssignedExpertInput) {
  const knownName =
    expertName?.trim() && !looksLikeOpaqueId(expertName) ? expertName.trim() : undefined;
  const shouldFetch = Boolean(expertId) && !knownName;
  const { data: expert, isLoading, isError } = useAssignedExpert(expertId, {
    enabled: shouldFetch,
  });

  return {
    name: knownName || getExpertDisplayName(expert),
    specialisation: expert?.specialisation,
    isLoading: shouldFetch && isLoading,
    isError: shouldFetch && isError,
  };
}
