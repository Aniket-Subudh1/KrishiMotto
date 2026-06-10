import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import {
  RobotoCondensed_400Regular,
  RobotoCondensed_500Medium,
  RobotoCondensed_600SemiBold,
  RobotoCondensed_700Bold,
  RobotoCondensed_400Regular_Italic,
} from '@expo-google-fonts/roboto-condensed';
import { Platform } from 'react-native';

export const FontLoadMap = {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  RobotoCondensed_400Regular,
  RobotoCondensed_500Medium,
  RobotoCondensed_600SemiBold,
  RobotoCondensed_700Bold,
  RobotoCondensed_400Regular_Italic,
} as const;

type FontWeightName = 'regular' | 'medium' | 'semibold' | 'bold';

const outfitAndroid: Record<FontWeightName, string> = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
};

const condensedAndroid: Record<FontWeightName, string> = {
  regular: 'RobotoCondensed_400Regular',
  medium: 'RobotoCondensed_500Medium',
  semibold: 'RobotoCondensed_600SemiBold',
  bold: 'RobotoCondensed_700Bold',
};

function resolveFamily(
  family: 'sans' | 'condensed',
  weight: FontWeightName = 'regular',
): string {
  if (Platform.OS === 'android') {
    return family === 'sans' ? outfitAndroid[weight] : condensedAndroid[weight];
  }

  return family === 'sans' ? 'Outfit' : 'Roboto Condensed';
}

export const Fonts = {
  sans: resolveFamily('sans'),
  sansMedium: resolveFamily('sans', 'medium'),
  sansSemibold: resolveFamily('sans', 'semibold'),
  sansBold: resolveFamily('sans', 'bold'),
  condensed: resolveFamily('condensed'),
  condensedMedium: resolveFamily('condensed', 'medium'),
  condensedSemibold: resolveFamily('condensed', 'semibold'),
  condensedBold: resolveFamily('condensed', 'bold'),
} as const;
