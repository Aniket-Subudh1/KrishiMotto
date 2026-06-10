import { Colors } from '@/constants/theme';

export function useThemeColor(
  props: { light?: string },
  colorName: keyof typeof Colors
) {
  if (props.light) {
    return props.light;
  }

  return Colors[colorName];
}
