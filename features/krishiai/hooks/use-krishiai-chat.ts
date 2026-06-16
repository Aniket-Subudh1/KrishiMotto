import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { toAiChatLanguage } from '@/lib/ai-language';
import { getApiErrorMessage } from '@/lib/api-error';
import { AI_CONVERSATION_KEY, aiService } from '@/services/ai.service';
import type { AiChatMessage } from '@/types/ai';
import type { AppLocale } from '@/constants/languages';

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type UseKrishiAiChatOptions = {
  locale: AppLocale;
  errorFallback: string;
};

export function useKrishiAiChat({ locale, errorFallback }: UseKrishiAiChatOptions) {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [failedPrompt, setFailedPrompt] = useState<string | null>(null);

  const chatMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const { data } = await aiService.chat({
        key: AI_CONVERSATION_KEY,
        prompt,
        lang: toAiChatLanguage(locale),
      });
      return data.data;
    },
    onMutate: (prompt) => {
      setFailedPrompt(null);
      const userMessage: AiChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: prompt,
      };
      setMessages((current) => [...current, userMessage]);
      return { userMessageId: userMessage.id };
    },
    onSuccess: (response) => {
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: 'assistant',
          content: response.reply,
          suggestedActions: response.suggestedActions,
        },
      ]);
    },
    onError: (error, prompt, context) => {
      setFailedPrompt(prompt);
      if (!context?.userMessageId) return;
      setMessages((current) => current.filter((message) => message.id !== context.userMessageId));
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await aiService.clearConversation(AI_CONVERSATION_KEY);
    },
    onSuccess: () => {
      setMessages([]);
      chatMutation.reset();
    },
  });

  const sendMessage = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || chatMutation.isPending) return;
      chatMutation.mutate(trimmed);
    },
    [chatMutation],
  );

  const clearConversation = useCallback(() => {
    if (clearMutation.isPending) return;
    clearMutation.mutate();
  }, [clearMutation]);

  const errorMessage = chatMutation.error
    ? getApiErrorMessage(chatMutation.error, errorFallback)
    : null;

  return {
    messages,
    sendMessage,
    clearConversation,
    failedPrompt,
    isSending: chatMutation.isPending,
    isClearing: clearMutation.isPending,
    errorMessage,
  };
}
