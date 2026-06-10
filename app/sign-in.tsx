import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { GradientBand } from '@/components/gradient-band';
import { Screen } from '@/components/layout/screen';
import { Button } from '@/components/ui/button';
import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { SELECTABLE_ROLES } from '@/constants/roles';
import { Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';
import { useAuthFlowStore } from '@/stores/auth-flow.store';

export default function SignInScreen() {
  const { t } = useAppLocale();
  const intent = useAuthFlowStore((s) => s.intent);
  const selectedRole = useAuthFlowStore((s) => s.selectedRole);

  if (!intent || !selectedRole) {
    return <Redirect href={'/get-started' as Href} />;
  }

  const roleOption = SELECTABLE_ROLES.find((role) => role.id === selectedRole);
  const isRegister = intent === 'register';

  return (
    <Screen edges={['top', 'bottom']} className="bg-background">
      <GradientBand className="absolute top-0 left-0 right-0 h-[5px]" />

      <View className="flex-1 items-center justify-center px-6">
        <Pressable
          onPress={() => router.replace(`/select-role?intent=${intent}` as Href)}
          className="mb-6 flex-row items-center gap-2 rounded-full border border-border bg-surface px-4 py-2"
        >
          <View
            className="h-7 w-7 items-center justify-center rounded-full"
            style={{ backgroundColor: roleOption?.accentBg }}
          >
            <Ionicons
              name={roleOption?.icon ?? 'person'}
              size={14}
              color={roleOption?.accentColor ?? Palette.indiaGreen}
            />
          </View>
          <Text className="text-[14px] font-semibold text-indigo">
            {t(`selectRole.${selectedRole}.title`)}
          </Text>
          <Text className="text-[12px] text-muted">{t('signIn.changeRole')}</Text>
        </Pressable>

        <FittedText
          fit
          maxLines={2}
          minScale={0.8}
          className="mb-2 w-full text-center text-[28px] font-bold leading-8 text-indigo"
        >
          {isRegister ? t('signIn.createAccount') : t('signIn.welcomeBack')}
        </FittedText>
        <FittedText
          shrink
          maxLines={4}
          className="mb-8 w-full text-center text-[15px] leading-[22px] text-muted"
        >
          {isRegister ? t('signIn.registerSubtitle') : t('signIn.subtitle')}
        </FittedText>
        <FittedText
          shrink
          maxLines={2}
          className="w-full text-center text-[14px] leading-5 text-muted"
        >
          {t('signIn.comingSoon')}
        </FittedText>
      </View>

      <View className="px-6 pb-6">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          onPress={() => router.replace('/(tabs)')}
        >
          {t('signIn.continueHome')}
        </Button>
      </View>

      <GradientBand className="absolute bottom-0 left-0 right-0 h-[5px]" />
    </Screen>
  );
}
