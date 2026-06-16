import type { ReactNode } from 'react';
import type { ScrollViewProps, StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from 'react-native-keyboard-controller';

export const DEFAULT_KEYBOARD_EXTRA_SPACE = 12;
export const DEFAULT_FORM_FOOTER_OFFSET = 88;

/**
 * Full-screen form shell with optional sticky footer.
 * Do not use inside bottom modals that only set max-height — flex-1 collapses the sheet.
 * Use `BottomSheetScroll` from `@/components/ui/bottom-sheet-modal` instead.
 */
type KeyboardAwareFormShellProps = {
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
  contentContainerStyle?: StyleProp<ViewStyle>;
  bottomOffset?: number;
  extraKeyboardSpace?: number;
  keyboardDismissMode?: ScrollViewProps['keyboardDismissMode'];
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  refreshControl?: ScrollViewProps['refreshControl'];
  scrollEnabled?: boolean;
  showsVerticalScrollIndicator?: boolean;
};

export function KeyboardAwareFormShell({
  children,
  footer,
  className = 'flex-1',
  contentClassName,
  contentContainerStyle,
  bottomOffset = 0,
  extraKeyboardSpace = DEFAULT_KEYBOARD_EXTRA_SPACE,
  keyboardDismissMode,
  keyboardShouldPersistTaps = 'handled',
  refreshControl,
  scrollEnabled = true,
  showsVerticalScrollIndicator = false,
}: KeyboardAwareFormShellProps) {
  return (
    <View className={className}>
      <KeyboardAwareScrollView
        className="flex-1"
        bottomOffset={bottomOffset}
        extraKeyboardSpace={extraKeyboardSpace}
        keyboardDismissMode={keyboardDismissMode}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        refreshControl={refreshControl}
        scrollEnabled={scrollEnabled}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      >
        <View className={contentClassName} style={contentContainerStyle}>
          {children}
        </View>
      </KeyboardAwareScrollView>

      {footer ? <KeyboardStickyView>{footer}</KeyboardStickyView> : null}
    </View>
  );
}
