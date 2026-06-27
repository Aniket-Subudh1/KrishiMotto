import {
  EventEmitter,
  requireOptionalNativeModule,
  type EventSubscription,
} from 'expo-modules-core';

type ExpoSmsEventPayload = {
  message: string;
};

type ExpoOtpAutofillConsentModule = {
  startSmsUserConsent(senderPhoneNumber?: string): Promise<void>;
  removeSmsListener(): void;
};

let cachedModule: ExpoOtpAutofillConsentModule | null | undefined;
let emitter: EventEmitter | null = null;

function loadModule(): ExpoOtpAutofillConsentModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  const native =
    requireOptionalNativeModule<ExpoOtpAutofillConsentModule>('ExpoOtpAutofillConsent');
  cachedModule = native ?? null;

  if (native) {
    emitter = new EventEmitter(native);
  }

  return cachedModule;
}

export function isSmsOtpAutofillSupported(): boolean {
  return loadModule() !== null;
}

export function addSmsListener(
  listener: (event: ExpoSmsEventPayload) => void,
): EventSubscription | null {
  if (!loadModule() || !emitter) {
    return null;
  }

  return emitter.addListener('onSmsReceived', listener);
}

export function addSmsTimeoutListener(
  listener: (event: ExpoSmsEventPayload) => void,
): EventSubscription | null {
  if (!loadModule() || !emitter) {
    return null;
  }

  return emitter.addListener('onSmsTimeout', listener);
}

export async function startSmsUserConsent(
  senderPhoneNumber?: string,
): Promise<boolean> {
  const module = loadModule();
  if (!module) {
    return false;
  }

  await module.startSmsUserConsent(senderPhoneNumber);
  return true;
}

export function removeSmsListener(): void {
  loadModule()?.removeSmsListener();
}
