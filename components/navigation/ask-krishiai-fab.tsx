import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { AppIcon } from '@/components/ui/app-icon';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type AskKrishiAiFabProps = {
  label: string;
};

export function AskKrishiAiFab({ label }: AskKrishiAiFabProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => router.push('/krishiai')}
      style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}
    >
      <AppIcon name="robot-happy-outline" size={16} color="#FFFFFF" />
      <Text className="max-w-[140px] text-[12px] font-semibold leading-4 text-white" numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: Palette.indiaGreen,
    shadowColor: Palette.indigo,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  fabPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
});
