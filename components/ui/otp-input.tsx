import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useRegisterScrollField } from '@/components/auth/auth-scroll-context';
import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { useSmsOtpAutofill } from '@/hooks/use-sms-otp-autofill';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  length?: number;
  fieldId?: string;
  resetKey?: number;
  autoFocus?: boolean;
  /** Listen for incoming OTP SMS on Android (User Consent API). */
  smsAutofill?: boolean;
};

const boxShadow: StyleProp<ViewStyle> = {
  shadowColor: Palette.indigo,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 2,
};

const activeBoxShadow: StyleProp<ViewStyle> = {
  shadowColor: Palette.indiaGreen,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 3,
};

export function OtpInput({
  value,
  onChange,
  error,
  length = 6,
  fieldId,
  resetKey = 0,
  autoFocus = true,
  smsAutofill = true,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const prevErrorRef = useRef(error);
  const remountingRef = useRef(false);
  const [focused, setFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [inputInstanceKey, setInputInstanceKey] = useState(0);
  const scrollField = useRegisterScrollField(fieldId ?? '__unused_otp__');
  const enableScroll = Boolean(fieldId);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

  const handleChange = useCallback(
    (text: string) => {
      onChange(text.replace(/\D/g, '').slice(0, length));
    },
    [length, onChange],
  );

  useSmsOtpAutofill({
    enabled: smsAutofill,
    length,
    restartKey: resetKey,
    onCode: handleChange,
  });

  const requestRemount = useCallback(() => {
    if (remountingRef.current) {
      return;
    }

    remountingRef.current = true;
    setInputInstanceKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (inputInstanceKey === 0) {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
      remountingRef.current = false;
    }, 100);

    return () => clearTimeout(timer);
  }, [inputInstanceKey]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => {
      remountingRef.current = false;
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      if (remountingRef.current) {
        return;
      }

      setKeyboardVisible(false);
      setFocused(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, [autoFocus]);

  useEffect(() => {
    if (resetKey === 0) {
      return;
    }

    requestRemount();
  }, [resetKey, requestRemount]);

  useEffect(() => {
    const previousError = prevErrorRef.current;
    prevErrorRef.current = error;

    if (!error || error === previousError) {
      return;
    }

    if (value) {
      onChange('');
    }

    requestRemount();
  }, [error, value, onChange, requestRemount]);

  function handleFocus() {
    setFocused(true);
    if (enableScroll) {
      scrollField.handleFocus();
    }
  }

  function handleBlur() {
    setFocused(false);
    if (enableScroll) {
      scrollField.handleBlur();
    }
  }

  function handleOtpPress() {
    if (keyboardVisible) {
      inputRef.current?.focus();
      return;
    }

    requestRemount();
  }

  const boxes = (
    <View className="relative">
      <View pointerEvents="none" className="flex-row justify-between gap-2">
        {digits.map((digit, index) => {
          const filled = digit.trim().length > 0;
          const active = focused && value.length === index;

          return (
            <View
              key={index}
              className={`h-[58px] flex-1 items-center justify-center rounded-2xl border-2 bg-white ${
                error
                  ? 'border-red-300 bg-red-50/40'
                  : active
                    ? 'border-india-green'
                    : filled
                      ? 'border-india-green/70'
                      : 'border-border/80'
              }`}
              style={active || filled ? activeBoxShadow : boxShadow}
            >
              <Text className="text-[24px] font-bold tracking-[1px] text-indigo">
                {filled ? digit : '·'}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={handleOtpPress}
        accessibilityRole="button"
        accessibilityLabel="OTP input"
        pointerEvents={keyboardVisible ? 'none' : 'box-only'}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
        }}
      />

      <TextInput
        key={`otp-input-${inputInstanceKey}`}
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        maxLength={length}
        onFocus={handleFocus}
        onBlur={handleBlur}
        caretHidden
        autoCorrect={false}
        spellCheck={false}
        showSoftInputOnFocus
        importantForAutofill="yes"
        pointerEvents={keyboardVisible ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          opacity: Platform.OS === 'ios' ? 0.02 : 0,
          fontSize: 16,
          color: 'transparent',
        }}
      />
    </View>
  );

  const content = (
    <View className="gap-3">
      {boxes}

      {error ? (
        <View className="flex-row items-center justify-center gap-1.5">
          <Ionicons name="alert-circle" size={14} color="#EF4444" />
          <Text className="text-[12px] text-red-500">{error}</Text>
        </View>
      ) : null}
    </View>
  );

  if (!enableScroll) {
    return content;
  }

  return (
    <View ref={scrollField.fieldRef} collapsable={false}>
      {content}
    </View>
  );
}

export function OtpHint({ phoneNumber }: { phoneNumber: string }) {
  return (
    <View
      className="items-center rounded-2xl border-2 border-border/80 bg-white px-5 py-5"
      style={boxShadow}
    >
      <View className="mb-3 h-14 w-14 items-center justify-center rounded-2xl bg-india-green/10">
        <Ionicons name="shield-checkmark" size={26} color={Palette.indiaGreen} />
      </View>
      <FittedText
        shrink
        maxLines={2}
        className="text-center text-[14px] leading-[21px] text-muted"
      >
        OTP sent to{' '}
        <Text className="font-bold tracking-[0.5px] text-indigo">+91 {phoneNumber}</Text>
      </FittedText>
    </View>
  );
}

export function ResendLink({
  onPress,
  loading,
  label,
  disabled,
}: {
  onPress: () => void;
  loading?: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || disabled}
      className="items-center py-3"
    >
      <Text
        className={`text-[14px] font-semibold ${
          loading || disabled ? 'text-muted' : 'text-primary'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
