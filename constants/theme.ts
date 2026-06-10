/**
 * KrishiMotto tricolour-inspired palette and theme tokens.
 */

import { Platform } from 'react-native';

export const Palette = {
  saffron: '#F4A460',
  indiaGreen: '#46962F',
  indigo: '#1A365D',
  marigold: '#E9AF43',
  paper: '#F5F5F5',
} as const;

const tintColorLight = Palette.indiaGreen;
const tintColorDark = Palette.marigold;

export const Colors = {
  light: {
    text: Palette.indigo,
    background: Palette.paper,
    tint: tintColorLight,
    icon: '#4A5568',
    tabIconDefault: '#718096',
    tabIconSelected: tintColorLight,
    accent: Palette.saffron,
    secondary: Palette.marigold,
  },
  dark: {
    text: Palette.paper,
    background: Palette.indigo,
    tint: tintColorDark,
    icon: '#A0AEC0',
    tabIconDefault: '#A0AEC0',
    tabIconSelected: tintColorDark,
    accent: Palette.saffron,
    secondary: Palette.indiaGreen,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
