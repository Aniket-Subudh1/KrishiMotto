import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

/** Refetches or invalidates cached queries whenever the screen gains focus. */
export function useQueryFocusRefresh(
  refresh: () => unknown | Promise<unknown>,
  enabled = true,
) {
  useFocusEffect(
    useCallback(() => {
      if (enabled) {
        void refresh();
      }
    }, [enabled, refresh]),
  );
}
