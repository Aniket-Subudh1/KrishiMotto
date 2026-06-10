import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
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

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  length?: number;
  fieldId?: string;
  resetKey?: number;
  autoFocus?: boolean;
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
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const scrollField = useRegisterScrollField(fieldId ?? '__unused_otp__');
  const enableScroll = Boolean(fieldId);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');

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

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timer);
  }, [resetKey]);

  function handleChange(text: string) {
    onChange(text.replace(/\D/g, '').slice(0, length));
  }

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

  const boxes = (
    <Pressable
      onPress={() => inputRef.current?.focus()}
      className="flex-row justify-between gap-2"
      accessibilityRole="button"
      accessibilityLabel="OTP input"
    >
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
    </Pressable>
  );

  const content = (
    <View className="gap-3">
      {boxes}

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{ position: 'absolute', opacity: 0, height: 1, width: 1 }}
      />

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
