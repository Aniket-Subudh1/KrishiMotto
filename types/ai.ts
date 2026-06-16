export const AI_CHAT_LANGUAGES = ['english', 'hindi', 'odia'] as const;
export type AiChatLanguage = (typeof AI_CHAT_LANGUAGES)[number];

export const AI_SUGGESTED_ACTIONS = [
  'BOOK_SERVICE',
  'GENERATE_CALENDAR',
  'DIAGNOSE_CROP',
  'EXPLAIN_SOIL',
  'VIEW_STORAGE',
  'APPLY_CREDIT',
  'BOOK_EXPERT_VISIT',
] as const;

export type AiSuggestedActionType = (typeof AI_SUGGESTED_ACTIONS)[number];

export type AiSuggestedAction = {
  action: AiSuggestedActionType;
  label: string;
  serviceIconType?: string;
  reason?: string;
};

export type AiChatRequest = {
  key: string;
  prompt: string;
  lang: AiChatLanguage;
};

export type AiChatResponse = {
  key: string;
  lang: AiChatLanguage;
  reply: string;
  suggestedActions: AiSuggestedAction[];
  messageCount: number;
  expiresInSeconds: number;
};

export type AiChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedActions?: AiSuggestedAction[];
};
