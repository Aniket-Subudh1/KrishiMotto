import { Pressable, View } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { FittedText } from '@/components/ui/fitted-text';
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
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}>
      <View
        className="overflow-hidden rounded-2xl bg-white"
        style={{
          shadowColor: Palette.indigo,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 4,
          borderWidth: 1,
          borderColor: 'rgba(226, 232, 240, 0.8)',
        }}
      >
        <View className="flex-row items-center gap-4 p-4">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'rgba(70, 150, 47, 0.1)' }}
          >
            <AppIcon name="map-marker-outline" size={24} color={Palette.indiaGreen} />
          </View>

          <View className="min-w-0 flex-1">
            <View className="flex-row items-start gap-2">
              <FittedText shrink maxLines={2} className="min-w-0 flex-1 text-[16px] font-bold leading-5 text-indigo">
                {parcel.name}
              </FittedText>
              <View
                className="max-w-[42%] rounded-full px-2.5 py-0.5"
                style={{
                  backgroundColor: isOwned
                    ? 'rgba(70, 150, 47, 0.12)'
                    : 'rgba(244, 164, 96, 0.15)',
                }}
              >
                <FittedText
                  maxLines={2}
                  fit
                  minScale={0.8}
                  className="text-center text-[10px] font-semibold leading-3"
                  style={{ color: isOwned ? Palette.indiaGreen : Palette.saffron }}
                >
                  {landTypeLabel(parcel.landType)}
                </FittedText>
              </View>
            </View>
            <View className="mt-1 flex-row items-center gap-1.5">
              <AppIcon name="terrain" size={13} color={Palette.indiaGreen} />
              <Text className="text-[14px] font-semibold text-india-green">
                {formatAcres(parcel.areaAcres)}
              </Text>
            </View>
            <View className="mt-1 flex-row items-center gap-1.5">
              <AppIcon name="calendar-month-outline" size={13} color="#94A3B8" />
              <Text className="text-[12px] text-muted">{formatDate(parcel.createdAt)}</Text>
            </View>
          </View>

          <View
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(70, 150, 47, 0.08)' }}
          >
            <AppIcon name="chevron-right" size={20} color={Palette.indiaGreen} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
