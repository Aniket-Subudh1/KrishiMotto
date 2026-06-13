import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type StatCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent?: 'green' | 'saffron' | 'marigold';
};

const accentMap = {
  green: { bg: 'rgba(70, 150, 47, 0.1)', color: Palette.indiaGreen },
  saffron: { bg: 'rgba(244, 164, 96, 0.15)', color: Palette.saffron },
  marigold: { bg: 'rgba(233, 175, 67, 0.15)', color: Palette.marigold },
};

export function StatCard({ icon, label, value, accent = 'green' }: StatCardProps) {
  const tone = accentMap[accent];

  return (
    <View
      className="flex-1 overflow-hidden rounded-2xl border border-border bg-white"
      style={{
        shadowColor: Palette.indigo,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
      }}
    >
      <View className="h-[3px] overflow-hidden">
        <LinearGradient
          colors={[Palette.saffron, Palette.indiaGreen]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </View>
      <View className="gap-3 p-4">
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: tone.bg }}
        >
          <Ionicons name={icon} size={20} color={tone.color} />
        </View>
        <View>
          <Text className="text-[11px] font-medium uppercase tracking-wide text-muted">
            {label}
          </Text>
          <Text className="mt-1 text-[22px] font-bold text-indigo">{value}</Text>
        </View>
      </View>
    </View>
  );
}
