import { Pressable, View } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { VISIT_PURPOSES, type VisitPurpose } from '@/types/booking';

const PURPOSE_ICONS: Record<VisitPurpose, AppIconName> = {
  'Pest & disease diagnosis': 'bug-outline',
  Advisory: 'chat-outline',
  Inspection: 'magnify',
  Other: 'dots-horizontal',
};

type VisitPurposePickerProps = {
  label: string;
  value: VisitPurpose;
  onChange: (value: VisitPurpose) => void;
  getLabel: (purpose: VisitPurpose) => string;
  error?: string;
};

export function VisitPurposePicker({
  label,
  value,
  onChange,
  getLabel,
  error,
}: VisitPurposePickerProps) {
  return (
    <View className="gap-2.5">
      <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>

      <View className="gap-2">
        {VISIT_PURPOSES.map((purpose) => {
          const selected = purpose === value;
          return (
            <Pressable
              key={purpose}
              onPress={() => onChange(purpose)}
              className={`flex-row items-center gap-3 rounded-2xl border px-4 py-3.5 ${
                selected ? 'border-india-green bg-surface' : 'border-border bg-white'
              }`}
            >
              <View
                className="h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: selected
                    ? 'rgba(70, 150, 47, 0.12)'
                    : 'rgba(26, 54, 93, 0.06)',
                }}
              >
                <AppIcon
                  name={PURPOSE_ICONS[purpose]}
                  size={18}
                  color={selected ? Palette.indiaGreen : Palette.indigo}
                />
              </View>
              <Text
                className={`min-w-0 flex-1 text-[14px] font-semibold ${
                  selected ? 'text-india-green' : 'text-indigo'
                }`}
              >
                {getLabel(purpose)}
              </Text>
              {selected ? (
                <AppIcon name="check-circle" size={22} color={Palette.indiaGreen} />
              ) : (
                <View className="h-5 w-5 rounded-full border-2 border-border" />
              )}
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <View className="flex-row items-center gap-1.5 px-1">
          <AppIcon name="alert-circle-outline" size={13} color="#EF4444" />
          <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
