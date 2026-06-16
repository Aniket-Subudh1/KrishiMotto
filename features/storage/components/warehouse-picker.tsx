import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import type { Warehouse } from '@/types/storage';

type WarehousePickerProps = {
  label: string;
  hint?: string;
  emptyMessage: string;
  warehouses: Warehouse[];
  selectedId: string | null;
  onSelect: (warehouseId: string) => void;
  loading?: boolean;
  error?: string;
};

export function WarehousePicker({
  label,
  hint,
  emptyMessage,
  warehouses,
  selectedId,
  onSelect,
  loading,
  error,
}: WarehousePickerProps) {
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

      {warehouses.length === 0 ? (
        <View className="rounded-2xl border border-dashed border-border bg-surface px-4 py-5">
          <Text className="text-center text-[14px] text-muted">{emptyMessage}</Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3 pr-1"
        >
          {warehouses.map((warehouse) => {
            const selected = warehouse.id === selectedId;
            return (
              <Pressable
                key={warehouse.id}
                onPress={() => onSelect(warehouse.id)}
                className={`w-[220px] overflow-hidden rounded-2xl border bg-white ${
                  selected ? 'border-india-green bg-surface' : 'border-border'
                }`}
              >
                <View className={`h-1 ${selected ? 'bg-india-green' : 'bg-transparent'}`} />
                <View className="gap-2 p-4">
                  <View className="flex-row items-start justify-between gap-2">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: 'rgba(233, 175, 67, 0.15)' }}
                    >
                      <AppIcon name="warehouse" size={18} color={Palette.marigold} />
                    </View>
                    {selected ? (
                      <View className="h-5 w-5 items-center justify-center rounded-full bg-india-green">
                        <AppIcon name="check" size={12} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </View>
                  <Text className="text-[15px] font-bold text-indigo" numberOfLines={2}>
                    {warehouse.name}
                  </Text>
                  <Text className="text-[12px] text-muted" numberOfLines={2}>
                    {warehouse.location}
                  </Text>
                  <Text className="text-[12px] font-medium text-india-green">
                    {warehouse.district}, {warehouse.state}
                  </Text>
                  {warehouse.capacityKg ? (
                    <Text className="text-[11px] text-muted">
                      {warehouse.capacityKg.toLocaleString('en-IN')} kg capacity
                    </Text>
                  ) : null}
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
