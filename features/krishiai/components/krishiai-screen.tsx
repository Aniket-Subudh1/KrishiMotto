import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorBanner } from '@/components/auth/auth-screen-layout';
import { Text } from '@/components/ui/text';
import { useKrishiAiChat } from '@/features/krishiai/hooks/use-krishiai-chat';
import { useSpeechInput } from '@/features/krishiai/hooks/use-speech-input';
import { resolveSuggestedActionRoute } from '@/features/krishiai/utils/action-routes';
import { AppBarGradient, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { showComingSoonAlert } from '@/lib/coming-soon';
import { useAuthStore } from '@/stores/auth.store';
import type { AiChatMessage, AiSuggestedAction } from '@/types/ai';

const SUGGESTED_PROMPT_KEYS = [
  'krishiai.prompts.yellowLeaves',
  'krishiai.prompts.calendar',
  'krishiai.prompts.soilTest',
] as const;

export function KrishiAiScreen() {
  const { t, locale } = useAppLocale();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);
  const listRef = useRef<FlatList<AiChatMessage>>(null);

  const [input, setInput] = useState('');
  const { messages, sendMessage, clearConversation, failedPrompt, isSending, isClearing, errorMessage } =
    useKrishiAiChat(locale);

  const speech = useSpeechInput({
    locale,
    onTranscript: setInput,
    disabled: isSending,
    unavailableMessage: t('krishiai.voiceUnavailable'),
  });

  useEffect(() => {
    if (failedPrompt) {
      setInput(failedPrompt);
    }
  }, [failedPrompt]);

  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages, isSending]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    if (speech.isListening) {
      speech.stopListening();
    }

    setInput('');
    sendMessage(trimmed);
  }, [input, isSending, sendMessage, speech]);

  const handleClear = useCallback(() => {
    Alert.alert(t('krishiai.clearTitle'), t('krishiai.clearBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('krishiai.clearConfirm'),
        style: 'destructive',
        onPress: () => {
          if (speech.isListening) {
            speech.stopListening();
          }
          setInput('');
          clearConversation();
        },
      },
    ]);
  }, [clearConversation, speech, t]);

  const handleSuggestedAction = useCallback(
    (action: AiSuggestedAction) => {
      const route = resolveSuggestedActionRoute(action);
      if (route) {
        router.push(route);
        return;
      }
      showComingSoonAlert(t);
    },
    [t],
  );

  if (!user) {
    return <Redirect href="/get-started" />;
  }

  return (
    <View className="flex-1 bg-background">
      <LinearGradient
        colors={[...AppBarGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          <View className="flex-1 items-center px-3">
            <View className="flex-row items-center gap-2">
              <Image
                source={require('@/assets/icons/ai.png')}
                style={{ width: 18, height: 18 }}
                contentFit="contain"
              />
              <Text className="text-[17px] font-bold text-white">{t('krishiai.title')}</Text>
            </View>
            <Text className="mt-0.5 text-[12px] text-white/80">{t('krishiai.subtitle')}</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('krishiai.clearTitle')}
            onPress={handleClear}
            disabled={isClearing || (messages.length === 0 && !isSending)}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/15"
          >
            {isClearing ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerClassName="grow px-5 pb-4 pt-4"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={<EmptyState t={t} onPromptPress={setInput} />}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              onActionPress={handleSuggestedAction}
              t={t}
            />
          )}
          ListFooterComponent={
            isSending ? (
              <View className="mt-3 flex-row items-center gap-2">
                <View className="rounded-2xl rounded-bl-md bg-white px-4 py-3">
                  <ActivityIndicator size="small" color={Palette.indiaGreen} />
                </View>
                <Text className="text-[13px] text-muted">{t('krishiai.thinking')}</Text>
              </View>
            ) : null
          }
        />

        {(errorMessage || speech.error) && (
          <View className="px-5 pb-2">
            <ErrorBanner message={errorMessage ?? speech.error ?? ''} />
          </View>
        )}

        <View
          className="border-t border-border bg-white px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
        >
          {speech.isListening ? (
            <View className="mb-2 flex-row items-center gap-2 rounded-xl bg-india-green/10 px-3 py-2">
              <View className="h-2 w-2 rounded-full bg-india-green" />
              <Text className="text-[13px] font-medium text-india-green">
                {t('krishiai.listening')}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-end gap-2">
            <View className="min-h-[48px] flex-1 flex-row items-end rounded-2xl border border-border bg-surface px-3 py-2">
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder={t('krishiai.inputPlaceholder')}
                placeholderTextColor="#94A3B8"
                multiline
                maxLength={4000}
                editable={!isSending}
                className="max-h-28 flex-1 text-[15px] leading-5 text-indigo"
                style={{ paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: 4 }}
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                speech.isListening ? t('krishiai.stopListening') : t('krishiai.startListening')
              }
              onPress={() => void speech.toggleListening()}
              disabled={isSending || !speech.isAvailable}
              className={`h-12 w-12 items-center justify-center rounded-2xl ${
                speech.isListening ? 'bg-red-500' : 'bg-indigo/10'
              }`}
            >
              <Ionicons
                name={speech.isListening ? 'stop' : 'mic'}
                size={22}
                color={speech.isListening ? '#FFFFFF' : Palette.indigo}
              />
            </Pressable>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('krishiai.send')}
              onPress={handleSend}
              disabled={!input.trim() || isSending}
              className={`h-12 w-12 items-center justify-center rounded-2xl ${
                input.trim() && !isSending ? 'bg-india-green' : 'bg-india-green/30'
              }`}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function EmptyState({
  t,
  onPromptPress,
}: {
  t: (key: string) => string;
  onPromptPress: (text: string) => void;
}) {
  return (
    <View className="flex-1 items-center justify-center py-10">
      <View
        className="mb-4 h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: 'rgba(70, 150, 47, 0.12)' }}
      >
        <Image
          source={require('@/assets/icons/ai.png')}
          style={{ width: 28, height: 28 }}
          contentFit="contain"
        />
      </View>
      <Text className="text-center text-[18px] font-bold text-indigo">{t('krishiai.welcome')}</Text>
      <Text className="mt-2 max-w-[280px] text-center text-[14px] leading-5 text-muted">
        {t('krishiai.welcomeBody')}
      </Text>

      <View className="mt-6 w-full gap-2">
        {SUGGESTED_PROMPT_KEYS.map((key) => (
          <Pressable
            key={key}
            onPress={() => onPromptPress(t(key))}
            className="rounded-2xl border border-border bg-white px-4 py-3"
          >
            <Text className="text-[14px] leading-5 text-indigo">{t(key)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function MessageBubble({
  message,
  onActionPress,
  t,
}: {
  message: AiChatMessage;
  onActionPress: (action: AiSuggestedAction) => void;
  t: (key: string) => string;
}) {
  const isUser = message.role === 'user';

  return (
    <View className={`mb-3 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-br-md bg-india-green'
            : 'rounded-bl-md border border-border bg-white'
        }`}
      >
        <Text className={`text-[15px] leading-[22px] ${isUser ? 'text-white' : 'text-indigo'}`}>
          {message.content}
        </Text>
      </View>

      {!isUser && message.suggestedActions && message.suggestedActions.length > 0 ? (
        <View className="mt-2 max-w-[85%] flex-row flex-wrap gap-2">
          {message.suggestedActions.map((action, index) => (
            <Pressable
              key={`${action.action}-${index}`}
              onPress={() => onActionPress(action)}
              className="rounded-full border border-india-green/30 bg-india-green/10 px-3 py-2"
            >
              <Text className="text-[13px] font-semibold text-india-green">{action.label}</Text>
              {action.reason ? (
                <Text className="mt-0.5 text-[11px] text-muted">{action.reason}</Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
