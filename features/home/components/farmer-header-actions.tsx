import type { ReactNode } from 'react';
import { View } from 'react-native';

import { LanguageSelector } from '@/components/language-selector';

type FarmerHeaderActionsProps = {
  children?: ReactNode;
};

export function FarmerHeaderActions({ children }: FarmerHeaderActionsProps) {
  return (
    <View className="shrink-0 flex-row items-center gap-2">
      <LanguageSelector variant="hero" />
      {children}
    </View>
  );
}
