import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Data is considered fresh for 5 minutes — no refetch on mount within that window.
       * This prevents redundant network calls when navigating between screens.
       */
      staleTime: 5 * 60 * 1000,
      /**
       * Unused cache is garbage-collected after 10 minutes.
       */
      gcTime: 10 * 60 * 1000,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      /**
       * RN apps don't have a concept of window focus;
       * background-to-foreground is handled via AppState if needed.
       */
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
