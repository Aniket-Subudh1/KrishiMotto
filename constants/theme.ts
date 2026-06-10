

import { DefaultTheme } from '@react-navigation/native';

import { Fonts as AppFonts } from '@/constants/fonts';

export const Palette = {
  saffron: '#F4A460',
  indiaGreen: '#46962F',
  indigo: '#1A365D',
  marigold: '#E9AF43',
  paper: '#F5F5F5',
  white: '#FFFFFF',
} as const;

export const AppBarGradient = [Palette.saffron, Palette.indiaGreen] as const;

export const Colors = {
  background: Palette.white,
  surface: Palette.paper,
  text: Palette.indigo,
  textMuted: '#4A5568',
  primary: Palette.indiaGreen,
  accent: Palette.marigold,
  warm: Palette.saffron,
  tint: Palette.indiaGreen,
  icon: '#4A5568',
  tabIconDefault: 'rgba(255,255,255,0.72)',
  tabIconSelected: Palette.white,
  border: '#E2E8F0',
  appBarGradient: AppBarGradient,
  splashGlow: 'rgba(244, 164, 96, 0.16)',
  splashSubtitle: Palette.indiaGreen,
};

export const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.indiaGreen,
    background: Palette.white,
    card: Palette.white,
    text: Palette.indigo,
    border: Colors.border,
  },
};

export const Fonts = AppFonts;
