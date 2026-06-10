import type { Ionicons } from '@expo/vector-icons';

import { Palette } from '@/constants/theme';
import type { UserRole } from '@/types/auth';

export type SelectableRole = Extract<UserRole, 'farmer' | 'expert'>;

export type RoleOption = {
  id: SelectableRole;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  accentBg: string;
};

export const SELECTABLE_ROLES: RoleOption[] = [
  {
    id: 'farmer',
    icon: 'leaf',
    accentColor: Palette.indiaGreen,
    accentBg: 'rgba(70, 150, 47, 0.12)',
  },
  {
    id: 'expert',
    icon: 'school',
    accentColor: Palette.saffron,
    accentBg: 'rgba(244, 164, 96, 0.16)',
  },
];
