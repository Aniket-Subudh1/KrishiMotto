import { focusManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

/** Connect React Native app foreground state to React Query's focus manager. */
export function setupQueryFocusManager() {
  focusManager.setEventListener((handleFocus) => {
    const subscription = AppState.addEventListener('change', (status: AppStateStatus) => {
      handleFocus(status === 'active');
    });

    return () => subscription.remove();
  });
}
