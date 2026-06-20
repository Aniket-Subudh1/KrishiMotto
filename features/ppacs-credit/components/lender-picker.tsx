import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import type { Lender } from '@/types/credit';

type LenderPickerProps = {
  label: string;
  hint?: string;
  emptyMessage: string;
  lenders: Lender[];
  selectedId: string | null;
  onSelect: (lenderId: string) => void;
  loading?: boolean;
  error?: string;
};

export function LenderPicker({
  label,
  hint,
  emptyMessage,
  lenders,
  selectedId,
  onSelect,
  loading,
  error,
}: LenderPickerProps) {
  if (loading) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator size="small" color={Palette.indiaGreen} />
      </View>
    );
  }

  return (
    <View className="gap-2.5">
      <View>
        <Text className="text-[14px] font-semibold leading-5 text-indigo">{label}</Text>
        {hint ? <Text className="mt-0.5 text-[12px] text-muted">{hint}</Text> : null}
      </View>

      {lenders.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-border bg-surface px-4 py-5">
          <Text className="text-center text-[14px] text-muted">{emptyMessage}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 pr-1"
        >
          {lenders.map((lender) => {
            const selected = lender.id === selectedId;
            return (
              <Pressable
                key={lender.id}
                onPress={() => onSelect(lender.id)}
                className={`w-[220px] overflow-hidden rounded-2xl border bg-white ${
                  selected ? 'border-india-green bg-surface' : 'border-border'
                }`}
              >
                <View className={`h-1 ${selected ? 'bg-india-green' : 'bg-transparent'}`} />
                <View className="gap-2 p-4">
                  <View className="flex-row items-start justify-between gap-2">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'rgba(26, 54, 93, 0.08)' }}
                    >
                      <AppIcon name="bank-outline" size={18} color={Palette.indigo} />
                    </View>
                    {selected ? (
                      <View className="h-5 w-5 items-center justify-center rounded-full bg-india-green">
                        <AppIcon name="check" size={12} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-[15px] font-bold text-indigo" numberOfLines={2}>
                    {lender.name}
                  </Text>
                  <Text className="text-[12px] text-muted" numberOfLines={1}>
                    {lender.type}
                  </Text>
                  <Text className="text-[12px] font-medium text-india-green">
                    {lender.district}, {lender.state}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {error ? (
        <View className="flex-row items-center gap-1.5 px-1">
          <AppIcon name="alert-circle-outline" size={13} color="#EF4444" />
          <Text className="flex-1 text-[12px] leading-4 text-red-500">{error}</Text>
        </View>
      ) : null}
    </View>
  );
}
