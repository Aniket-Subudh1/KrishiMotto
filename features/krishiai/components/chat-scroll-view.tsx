import { forwardRef, useCallback } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { DEFAULT_KEYBOARD_EXTRA_SPACE } from '@/components/ui/keyboard-aware-form-shell';

import type { RefCallback } from 'react';
import type { ScrollView, ScrollViewProps } from 'react-native';
import type { KeyboardAwareScrollViewProps } from 'react-native-keyboard-controller';

type ChatScrollViewRef = React.ElementRef<typeof KeyboardAwareScrollView>;
type ChatScrollViewProps = ScrollViewProps &
  KeyboardAwareScrollViewProps & {
    chatScrollRef?: { current: ChatScrollViewRef | null };
  };

export const ChatScrollView = forwardRef<ChatScrollViewRef, ChatScrollViewProps>(
  ({ chatScrollRef, bottomOffset = 0, extraKeyboardSpace = DEFAULT_KEYBOARD_EXTRA_SPACE, ...props }, ref) => {
    const combinedRef: RefCallback<ChatScrollViewRef> = useCallback(
      (instance) => {
        if (typeof ref === 'function') {
          ref(instance);
        } else if (ref) {
          ref.current = instance;
        }

        if (chatScrollRef) {
          chatScrollRef.current = instance;
        }
      },
      [chatScrollRef, ref],
    );

    return (
      <KeyboardAwareScrollView
        ref={combinedRef}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        keyboardDismissMode="interactive"
        bottomOffset={bottomOffset}
        extraKeyboardSpace={extraKeyboardSpace}
        {...props}
      />
    );
  },
);

ChatScrollView.displayName = 'ChatScrollView';

export type { ChatScrollViewRef, ScrollView };
