import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import { toSpeechLocale } from '@/lib/ai-language';
import {
  getSpeechRecognitionModule,
  isSpeechRecognitionSupported,
  type SpeechRecognitionErrorEvent,
  type SpeechRecognitionResultEvent,
} from '@/lib/speech-recognition';
import type { AppLocale } from '@/constants/languages';

type UseSpeechInputOptions = {
  locale: AppLocale;
  onTranscript: (text: string) => void;
  disabled?: boolean;
  unavailableMessage?: string;
};

export function useSpeechInput({
  locale,
  onTranscript,
  disabled = false,
  unavailableMessage = 'Voice input is not available in this build. Use a development build to enable the microphone.',
}: UseSpeechInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef('');
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    setIsAvailable(isSpeechRecognitionSupported());
  }, []);

  useEffect(() => {
    const module = getSpeechRecognitionModule();
    if (!module) return;

    const subscriptions = [
      module.addListener('start', () => {
        setIsListening(true);
        setError(null);
        transcriptRef.current = '';
      }),
      module.addListener('end', () => {
        setIsListening(false);
        transcriptRef.current = '';
      }),
      module.addListener('result', (event) => {
        const resultEvent = event as SpeechRecognitionResultEvent;
        const transcript = resultEvent.results[0]?.transcript?.trim() ?? '';
        if (!transcript) return;

        transcriptRef.current = transcript;
        onTranscriptRef.current(transcript);
      }),
      module.addListener('error', (event) => {
        const errorEvent = event as SpeechRecognitionErrorEvent;
        setIsListening(false);
        if (errorEvent.error === 'aborted' || errorEvent.error === 'no-speech') {
          return;
        }
        setError(errorEvent.message || errorEvent.error);
      }),
    ];

    return () => {
      subscriptions.forEach((subscription) => subscription.remove());
      try {
        module.abort();
      } catch {
        // Native module may already be torn down.
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    const module = getSpeechRecognitionModule();
    if (!module) {
      setIsListening(false);
      return;
    }

    try {
      module.stop();
    } catch {
      setIsListening(false);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (disabled || isListening) return false;

    setError(null);

    const module = getSpeechRecognitionModule();
    if (!module || !isSpeechRecognitionSupported()) {
      setError(unavailableMessage);
      return false;
    }

    try {
      const permissions = await module.requestPermissionsAsync();
      if (!permissions.granted) {
        setError('Microphone permission is required for voice input.');
        return false;
      }

      module.start({
        lang: toSpeechLocale(locale),
        interimResults: true,
        continuous: false,
        maxAlternatives: 1,
        addsPunctuation: true,
        contextualStrings: [
          'KrishiAI',
          'KrishiMotto',
          'crop',
          'soil',
          'fertilizer',
          'pest',
          'irrigation',
          'harvest',
          'urea',
          'DAP',
          'NPK',
        ],
        ...(Platform.OS === 'ios'
          ? {
              iosTaskHint: 'dictation' as const,
            }
          : {}),
      });

      if (Platform.OS !== 'web') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
          // Haptics are optional.
        });
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : unavailableMessage);
      return false;
    }
  }, [disabled, isListening, locale, unavailableMessage]);

  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
      return;
    }
    await startListening();
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    isAvailable,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearError: () => setError(null),
  };
}
