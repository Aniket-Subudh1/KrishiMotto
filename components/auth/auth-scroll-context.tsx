import { createContext, useCallback, useContext, useRef, type RefObject } from 'react';
import { Platform, type View } from 'react-native';

type AuthScrollContextValue = {
  contentRef: RefObject<View | null>;
  setActiveField: (id: string | null) => void;
  scrollToFieldRef: (fieldRef: RefObject<View | null>) => void;
};

export const AuthScrollContext = createContext<AuthScrollContextValue | null>(null);

export function useAuthScroll() {
  return useContext(AuthScrollContext);
}

export function useRegisterScrollField(fieldId: string) {
  const context = useAuthScroll();
  const fieldRef = useRef<View>(null);

  const scrollToField = useCallback(() => {
    if (!context) {
      return;
    }

    context.setActiveField(fieldId);
    const delay = Platform.OS === 'ios' ? 80 : 180;
    setTimeout(() => {
      context.scrollToFieldRef(fieldRef);
    }, delay);
  }, [context, fieldId]);

  const handleFocus = useCallback(() => {
    context?.setActiveField(fieldId);
    scrollToField();
  }, [context, fieldId, scrollToField]);

  const handleBlur = useCallback(() => {
    if (context) {
      context.setActiveField(null);
    }
  }, [context]);

  return { fieldRef, scrollToField, handleFocus, handleBlur };
}
