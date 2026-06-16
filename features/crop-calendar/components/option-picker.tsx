import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type OptionPickerProps<T extends string> = {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  getLabel?: (value: T) => string;
  error?: string;
};

export function OptionPicker<T extends string>({
  label,
  value,
  options,
  onChange,
  getLabel = (option) => option,
  error,
}: OptionPickerProps<T>) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  return (
    <View className="gap-2">
      <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>

      <Pressable
        onPress={() => setOpen(true)}
        className={`min-h-[52px] flex-row items-center justify-between rounded-2xl border bg-white px-3.5 ${
          error ? 'border-red-300' : 'border-border'
        }`}
      >
        <Text className="text-[16px] text-indigo">{getLabel(value)}</Text>
        <Ionicons name="chevron-down" size={18} color={Palette.indigo} />
      </Pressable>

      {error ? (
        <View className="flex-row items-center gap-1.5 px-1">
          <Ionicons name="alert-circle" size={13} color="#EF4444" />
          <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
        </View>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/40" onPress={() => setOpen(false)} />
        <View
          className="max-h-[70%] rounded-t-3xl bg-white"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="items-center py-3">
            <View className="h-1 w-10 rounded-full bg-border" />
          </View>
          <Text className="px-5 pb-3 text-[16px] font-bold text-indigo">{label}</Text>
          <ScrollView>
            {options.map((option) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  onPress={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                  className={`flex-row items-center justify-between px-5 py-4 ${
                    selected ? 'bg-surface' : ''
                  }`}
                >
                  <Text
                    className={`text-[16px] ${selected ? 'font-semibold text-india-green' : 'text-indigo'}`}
                  >
                    {getLabel(option)}
                  </Text>
                  {selected ? (
                    <Ionicons name="checkmark-circle" size={20} color={Palette.indiaGreen} />
                  ) : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
