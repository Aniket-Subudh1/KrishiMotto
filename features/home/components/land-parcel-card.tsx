import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { formatAcres, formatDate } from '@/lib/format';
import type { LandParcel } from '@/types/farmer';

type LandParcelCardProps = {
  parcel: LandParcel;
  onPress: () => void;
  landTypeLabel: (type: LandParcel['landType']) => string;
};

export function LandParcelCard({ parcel, onPress, landTypeLabel }: LandParcelCardProps) {
  const isOwned = parcel.landType === 'OWNED';

  return (
    <Pressable onPress={onPress}>
      <View
        className="overflow-hidden rounded-2xl border border-border bg-white"
        style={{
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center gap-3 p-4">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
          >
            <Ionicons name="map-outline" size={22} color={Palette.indiaGreen} />
          </View>

          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="min-w-0 flex-1 text-[16px] font-bold text-indigo" numberOfLines={1}>
                {parcel.name}
              </Text>
              <View
                className="rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: isOwned
                    ? 'rgba(70, 150, 47, 0.12)'
                    : 'rgba(244, 164, 96, 0.15)',
                }}
              >
                <Text
                  className="text-[10px] font-semibold"
                  style={{ color: isOwned ? Palette.indiaGreen : Palette.saffron }}
                >
                  {landTypeLabel(parcel.landType)}
                </Text>
              </View>
            </View>
            <Text className="mt-1 text-[14px] font-semibold text-india-green">
              {formatAcres(parcel.areaAcres)}
            </Text>
            <Text className="mt-0.5 text-[12px] text-muted">
              {formatDate(parcel.createdAt)}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        </View>
      </View>
    </Pressable>
  );
}
