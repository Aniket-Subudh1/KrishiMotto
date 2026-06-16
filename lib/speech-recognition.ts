import { requireOptionalNativeModule } from 'expo-modules-core';

export type SpeechRecognitionResultEvent = {
  results: Array<{ transcript?: string }>;
  isFinal?: boolean;
};

export type SpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

type SpeechRecognitionModule = {
  isRecognitionAvailable(): boolean;
  requestPermissionsAsync(): Promise<{ granted: boolean }>;
  start(options: Record<string, unknown>): void;
  stop(): void;
  abort(): void;
  addListener(
    event: 'start' | 'end' | 'result' | 'error',
    callback: (event: SpeechRecognitionResultEvent | SpeechRecognitionErrorEvent) => void,
  ): { remove: () => void };
};

let cachedModule: SpeechRecognitionModule | null | undefined;

function loadSpeechModule(): SpeechRecognitionModule | null {
  if (cachedModule !== undefined) {
    return cachedModule;
  }

  const native = requireOptionalNativeModule<SpeechRecognitionModule>('ExpoSpeechRecognition');
  if (native) {
    cachedModule = native;
    return native;
  }

  try {
    const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition') as {
      ExpoSpeechRecognitionModule: SpeechRecognitionModule;
    };
    cachedModule = ExpoSpeechRecognitionModule;
    return cachedModule;
  } catch {
    cachedModule = null;
    return null;
  }
}

export function getSpeechRecognitionModule(): SpeechRecognitionModule | null {
  return loadSpeechModule();
}

export function isSpeechRecognitionSupported(): boolean {
  const module = loadSpeechModule();
  if (!module) return false;

  try {
    return module.isRecognitionAvailable();
  } catch {
    return false;
  }
}
