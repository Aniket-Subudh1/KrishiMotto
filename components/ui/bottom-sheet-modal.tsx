import type { ComponentProps, ReactNode } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type BottomSheetModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
  sheetClassName?: string;
};

export function BottomSheetModal({
  visible,
  onClose,
  children,
  animationType = 'slide',
  sheetClassName = '',
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType={animationType} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onClose} accessibilityRole="button" />
        <View
          className={sheetClassName.trim()}
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

type BottomSheetScrollProps = Omit<
  ComponentProps<typeof KeyboardAwareScrollView>,
  'keyboardShouldPersistTaps' | 'showsVerticalScrollIndicator' | 'bounces'
>;

/** Scroll area for bottom sheets with inputs. Avoid flex-1 here — sheets size from content. */
export function BottomSheetScroll({
  bottomOffset = 16,
  ...props
}: BottomSheetScrollProps) {
  return (
    <KeyboardAwareScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bounces={false}
      bottomOffset={bottomOffset}
      {...props}
    />
  );
}
