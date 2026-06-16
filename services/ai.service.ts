import { apiClient } from '@/lib/api-client';
import type { V1Response } from '@/types/api';
import type { AiChatRequest, AiChatResponse } from '@/types/ai';

export const AI_CONVERSATION_KEY = 'krishiai';

export const aiService = {
  chat: (payload: AiChatRequest) =>
    apiClient.post<V1Response<AiChatResponse>>('/ai/chat', payload, {
      timeout: 60_000,
    }),

  clearConversation: (key: string) =>
    apiClient.delete<V1Response<{ cleared: boolean; key: string }>>(`/ai/chat/${key}`),
};
