import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

import {
  addSmsListener,
  addSmsTimeoutListener,
  isSmsOtpAutofillSupported,
  removeSmsListener,
  startSmsUserConsent,
} from '@/lib/sms-otp-autofill-consent';
import { extractOtpFromMessage } from '@/lib/otp';

type UseSmsOtpAutofillOptions = {
  enabled?: boolean;
  length?: number;
  restartKey?: number;
  onCode: (code: string) => void;
};

export function useSmsOtpAutofill({
  enabled = true,
  length = 6,
  restartKey = 0,
  onCode,
}: UseSmsOtpAutofillOptions) {
  const onCodeRef = useRef(onCode);
  onCodeRef.current = onCode;

  useEffect(() => {
    if (!enabled || Platform.OS !== 'android' || !isSmsOtpAutofillSupported()) {
      return;
    }

    let cancelled = false;
    let smsSubscription: { remove: () => void } | null = null;
    let timeoutSubscription: { remove: () => void } | null = null;

    async function startListening() {
      if (cancelled) {
        return;
      }

      removeSmsListener();
      smsSubscription?.remove();
      timeoutSubscription?.remove();

      const started = await startSmsUserConsent();
      if (!started || cancelled) {
        removeSmsListener();
        return;
      }

      smsSubscription = addSmsListener((event) => {
        const code = extractOtpFromMessage(event.message, length);
        if (code) {
          onCodeRef.current(code);
        }
      });

      timeoutSubscription = addSmsTimeoutListener(() => {
        if (!cancelled) {
          void startListening();
        }
      });
    }

    void startListening();

    return () => {
      cancelled = true;
      smsSubscription?.remove();
      timeoutSubscription?.remove();
      removeSmsListener();
    };
  }, [enabled, length, restartKey]);
}
