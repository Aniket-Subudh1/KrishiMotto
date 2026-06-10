import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Platform,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { useRegisterScrollField } from '@/components/auth/auth-scroll-context';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type IconName = keyof typeof Ionicons.glyphMap;

type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  fieldId?: string;
  error?: string;
  hint?: string;
  icon?: IconName;
  containerClassName?: string;
  inputClassName?: string;
};

function FieldLabel({ label }: { label: string }) {
  return (
    <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>
  );
}

function InputIcon({ icon, focused }: { icon: IconName; focused: boolean }) {
  return (
    <View
      className={`mr-3 h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
        focused ? 'bg-india-green/10' : 'bg-surface'
      }`}
    >
      <Ionicons
        name={icon}
        size={18}
        color={focused ? Palette.indiaGreen : Palette.indigo}
      />
    </View>
  );
}

function HelperText({ error, hint }: { error?: string; hint?: string }) {
  if (error) {
    return (
      <View className="flex-row items-center gap-1.5 px-1">
        <Ionicons name="alert-circle" size={13} color="#EF4444" />
        <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
      </View>
    );
  }

  if (hint) {
    return <Text className="px-1 text-[12px] leading-4 text-muted">{hint}</Text>;
  }

  return null;
}

export function Input({
  label,
  fieldId,
  error,
  hint,
  icon,
  containerClassName = '',
  inputClassName = '',
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const scrollField = useRegisterScrollField(fieldId ?? '__unused_input__');
  const hasError = Boolean(error);
  const isActive = focused && !hasError;
  const enableScroll = Boolean(fieldId);

  function handleFocus(event: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) {
    setFocused(true);
    if (enableScroll) {
      scrollField.handleFocus();
    }
    onFocus?.(event);
  }

  function handleBlur(event: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) {
    setFocused(false);
    if (enableScroll) {
      scrollField.handleBlur();
    }
    onBlur?.(event);
  }

  const field = (
    <View className={`gap-2 ${containerClassName}`}>
      <FieldLabel label={label} />

      <View
        className={`min-h-[52px] flex-row items-center rounded-2xl border bg-white px-3.5 ${
          hasError
            ? 'border-red-300'
            : isActive
              ? 'border-india-green'
              : 'border-border'
        }`}
      >
        {icon ? <InputIcon icon={icon} focused={isActive} /> : null}

        <TextInput
          placeholderTextColor="#94A3B8"
          className={`min-h-[48px] flex-1 py-2 text-[16px] leading-[22px] text-indigo ${inputClassName}`}
          style={Platform.OS === 'android' ? { includeFontPadding: false } : undefined}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </View>

      <HelperText error={error} hint={hint} />
    </View>
  );

  if (!enableScroll) {
    return field;
  }

  return (
    <View ref={scrollField.fieldRef} collapsable={false}>
      {field}
    </View>
  );
}

type PhoneInputProps = {
  label: string;
  fieldId?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
};

export function PhoneInput({
  label,
  fieldId,
  error,
  hint,
  value,
  onChangeText,
  placeholder,
  containerClassName = '',
}: PhoneInputProps) {
  const [focused, setFocused] = useState(false);
  const scrollField = useRegisterScrollField(fieldId ?? '__unused_phone__');
  const hasError = Boolean(error);
  const isActive = focused && !hasError;
  const enableScroll = Boolean(fieldId);

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

  const field = (
    <View className={`gap-2 ${containerClassName}`}>
      <FieldLabel label={label} />

      <View
        className={`min-h-[52px] flex-row items-center overflow-hidden rounded-2xl border bg-white ${
          hasError
            ? 'border-red-300'
            : isActive
              ? 'border-india-green'
              : 'border-border'
        }`}
      >
        <View
          className={`h-full flex-row items-center gap-2 border-r px-3 ${
            isActive ? 'border-india-green/20 bg-india-green/5' : 'border-border bg-surface'
          }`}
        >
          <Ionicons
            name="call-outline"
            size={16}
            color={isActive ? Palette.indiaGreen : Palette.indigo}
          />
          <Text className="text-[14px] font-bold text-indigo">+91</Text>
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          keyboardType="phone-pad"
          maxLength={10}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="min-h-[52px] flex-1 px-3 text-[16px] font-medium tracking-[0.5px] text-indigo"
          style={Platform.OS === 'android' ? { includeFontPadding: false } : undefined}
        />
      </View>

      <HelperText error={error} hint={hint} />
    </View>
  );

  if (!enableScroll) {
    return field;
  }

  return (
    <View ref={scrollField.fieldRef} collapsable={false}>
      {field}
    </View>
  );
}
