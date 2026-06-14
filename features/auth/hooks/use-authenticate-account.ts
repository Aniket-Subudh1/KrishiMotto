import { useMutation } from '@tanstack/react-query';

import type { SelectableRole } from '@/constants/roles';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import type { FarmerAuthenticatePayload } from '@/types/auth';

type AuthenticateAccountPayload = FarmerAuthenticatePayload & {
  role: SelectableRole;
};

export function useAuthenticateAccount() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async ({ role, ...payload }: AuthenticateAccountPayload) => {
      const authenticate =
        role === 'farmer'
          ? authService.authenticateFarmer
          : authService.authenticateExpert;
      const { data } = await authenticate(payload);
      return data.response;
    },
    onSuccess: (response) => {
      setAuth(response.user, response.token, response.refreshToken);
    },
  });
}
