import { useMutation } from '@tanstack/react-query';

import { authService } from '@/services/auth.service';
import type { SendOtpPayload } from '@/types/auth';

export function useSendOtp() {
  return useMutation({
    mutationFn: async (payload: SendOtpPayload) => {
      const { data } = await authService.sendOtp(payload);
      return data.response;
    },
  });
}
