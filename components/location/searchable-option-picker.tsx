import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from 'react-native';

import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette, Colors } from '@/constants/theme';

type SearchableOptionPickerProps = {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  emptyLabel?: string;
};

export function SearchableOptionPicker({
  label,
  value,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  disabled = false,
  loading = false,
  error,
  emptyLabel = 'No matches found',
}: SearchableOptionPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return options;
    }
    return options.filter((option) => option.toLowerCase().includes(normalized));
  }, [options, query]);

  function handleOpen() {
    if (disabled || loading) {
      return;
    }
    setQuery('');
    setOpen(true);
  }

  function handleSelect(option: string) {
    onChange(option);
    setOpen(false);
    setQuery('');
  }

  const displayValue = value || placeholder;
  const hasValue = Boolean(value);

  return (
    <View className="gap-2">
      <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>

      <Pressable
        onPress={handleOpen}
        disabled={disabled || loading}
        className={`min-h-[52px] flex-row items-center justify-between rounded-2xl border bg-white px-3.5 ${
          error ? 'border-red-300' : 'border-border'
        } ${disabled || loading ? 'opacity-60' : ''}`}
      >
        <Text className={`flex-1 text-[16px] ${hasValue ? 'text-indigo' : 'text-muted'}`}>
          {displayValue}
        </Text>
        {loading ? (
          <ActivityIndicator size="small" color={Palette.indiaGreen} />
        ) : (
          <AppIcon name="chevron-down" size={18} color={Palette.indigo} />
        )}
      </Pressable>

      {error ? (
        <View className="flex-row items-center gap-1.5 px-1">
          <AppIcon name="alert-circle-outline" size={13} color="#EF4444" />
          <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
        </View>
      ) : null}

      <BottomSheetModal
        visible={open}
        onClose={() => setOpen(false)}
        sheetClassName="max-h-[75%] rounded-t-3xl bg-white"
      >
        <View className="items-center py-3">
          <View className="h-1 w-10 rounded-full bg-border" />
        </View>
        <Text className="px-5 pb-3 text-[16px] font-bold text-indigo">{label}</Text>

        <View className="mx-5 mb-3 flex-row items-center rounded-2xl border border-border bg-surface px-3">
          <AppIcon name="magnify" size={18} color={Colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            className="flex-1 px-2.5 py-3 text-[16px] text-indigo"
          />
        </View>

        <ScrollView keyboardShouldPersistTaps="handled">
          {filteredOptions.length === 0 ? (
            <View className="px-5 py-6">
              <Text className="text-center text-[14px] text-muted">{emptyLabel}</Text>
            </View>
          ) : (
            filteredOptions.map((option) => {
              const selected = option === value;
              return (
                <Pressable
                  key={option}
                  onPress={() => handleSelect(option)}
                  className={`flex-row items-center justify-between px-5 py-4 ${
                    selected ? 'bg-surface' : ''
                  }`}
                >
                  <Text
                    className={`flex-1 text-[16px] ${
                      selected ? 'font-semibold text-india-green' : 'text-indigo'
                    }`}
                  >
                    {option}
                  </Text>
                  {selected ? (
                    <AppIcon name="check-circle" size={20} color={Palette.indiaGreen} />
                  ) : null}
                </Pressable>
              );
            })
          )}
        </ScrollView>
      </BottomSheetModal>
    </View>
  );
}
