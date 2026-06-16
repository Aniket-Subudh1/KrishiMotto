import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type AppIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type AppIconProps = {
  name: AppIconName;
  size?: number;
  color?: string;
} & Omit<ComponentProps<typeof MaterialCommunityIcons>, 'name' | 'size' | 'color'>;

export function AppIcon({ name, size = 24, color, ...rest }: AppIconProps) {
  return <MaterialCommunityIcons name={name} size={size} color={color} {...rest} />;
}
