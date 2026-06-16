import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';

import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { useAppLocale } from '@/hooks/use-app-locale';
import { parseLocalIsoDate, toLocalIsoDate } from '@/lib/date';
import { Palette } from '@/constants/theme';

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  error?: string;
};

function formatDisplayDate(value: string, emptyLabel: string): string {
  if (!value) return emptyLabel;
  const date = parseLocalIsoDate(value);
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function DateField({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  error,
}: DateFieldProps) {
  const { t } = useAppLocale();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(parseLocalIsoDate(value));
  const isWeb = Platform.OS === 'web';

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setOpen(false);
      if (event.type === 'set' && selected) {
        onChange(toLocalIsoDate(selected));
      }
      return;
    }

    if (selected) {
      setDraft(selected);
    }
  }

  function confirmIos() {
    onChange(toLocalIsoDate(draft));
    setOpen(false);
  }

  return (
    <View className="gap-2">
      <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>

      <Pressable
        onPress={() => {
          if (isWeb) return;
          setDraft(parseLocalIsoDate(value));
          setOpen(true);
        }}
        className={`min-h-[52px] flex-row items-center rounded-2xl border bg-white px-3.5 ${
          error ? 'border-red-300' : 'border-border'
        }`}
      >
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-surface">
          <AppIcon name="calendar-month-outline" size={18} color={Palette.indiaGreen} />
        </View>
        {isWeb ? (
          <TextInput
            value={value}
            onChangeText={onChange}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            className="flex-1 text-[16px] text-indigo"
          />
        ) : (
          <>
            <Text className="flex-1 text-[16px] text-indigo">
              {formatDisplayDate(value, t('common.selectDate'))}
            </Text>
            <AppIcon name="chevron-down" size={18} color={Palette.indigo} />
          </>
        )}
      </Pressable>

      {error ? (
        <View className="flex-row items-center gap-1.5 px-1">
          <AppIcon name="alert-circle-outline" size={13} color="#EF4444" />
          <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
        </View>
      ) : null}

      {Platform.OS === 'android' && open ? (
        <DateTimePicker
          value={draft}
          mode="date"
          display="default"
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}

      {Platform.OS === 'ios' && !isWeb ? (
        <BottomSheetModal
          visible={open}
          onClose={() => setOpen(false)}
          sheetClassName="rounded-t-3xl bg-white px-4 pt-3"
        >
          <View className="mb-2 flex-row items-center justify-between">
            <Pressable onPress={() => setOpen(false)} className="px-2 py-2">
              <Text className="text-[16px] text-muted">{t('common.cancel')}</Text>
            </Pressable>
            <Text className="text-[16px] font-semibold text-indigo">{label}</Text>
            <Pressable onPress={confirmIos} className="px-2 py-2">
              <Text className="text-[16px] font-semibold text-india-green">{t('common.done')}</Text>
            </Pressable>
          </View>
          <DateTimePicker
            value={draft}
            mode="date"
            display="spinner"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleChange}
          />
        </BottomSheetModal>
      ) : null}
    </View>
  );
}
