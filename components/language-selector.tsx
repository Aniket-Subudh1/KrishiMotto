import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from 'react-native';

import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { LANGUAGES } from '@/constants/languages';
import { Colors, Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';

export function LanguageSelector() {
  const { t, locale, setLocale } = useAppLocale();
  const [open, setOpen] = useState(false);

  const current = LANGUAGES.find((lang) => lang.code === locale) ?? LANGUAGES[0];

  function handleSelect(code: typeof locale) {
    setLocale(code);
    setOpen(false);
  }

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        className="max-w-[92px] shrink-0 flex-row items-center gap-1 rounded-full border border-border bg-surface px-2 py-1"
        accessibilityRole="button"
        accessibilityLabel={t('languageSelector.title')}
      >
        <Ionicons name="language-outline" size={12} color={Palette.indigo} />
        <FittedText
          fit
          shrink
          maxLines={1}
          minScale={0.75}
          className="max-w-[56px] font-condensed-semibold text-[10px] tracking-[0.1px] text-muted"
          style={
            Platform.OS === 'android' ? { includeFontPadding: false } : undefined
          }
        >
          {current.nativeLabel}
        </FittedText>
        <Ionicons name="chevron-down" size={10} color={Colors.textMuted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="max-h-[85%] rounded-t-2xl bg-background px-5 pb-8 pt-5"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="mb-1 flex-row items-start justify-between gap-3">
              <View className="min-w-0 flex-1">
                <FittedText
                  shrink
                  maxLines={2}
                  className="text-lg font-bold leading-6 text-indigo"
                >
                  {t('languageSelector.title')}
                </FittedText>
                <FittedText
                  shrink
                  maxLines={2}
                  className="mt-0.5 text-sm leading-5 text-muted"
                >
                  {t('languageSelector.subtitle')}
                </FittedText>
              </View>
              <Pressable
                onPress={() => setOpen(false)}
                className="h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface"
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={18} color={Palette.indigo} />
              </Pressable>
            </View>

            <ScrollView className="mt-4" bounces={false}>
              {LANGUAGES.map((lang) => {
                const selected = lang.code === locale;

                return (
                  <Pressable
                    key={lang.code}
                    onPress={() => handleSelect(lang.code)}
                    className={`mb-2 flex-row items-center justify-between gap-3 rounded-xl border px-4 py-3.5 ${
                      selected
                        ? 'border-india-green bg-surface'
                        : 'border-border bg-background'
                    }`}
                  >
                    <View className="min-w-0 flex-1">
                      <FittedText
                        shrink
                        maxLines={1}
                        className="text-base font-semibold text-indigo"
                      >
                        {lang.nativeLabel}
                      </FittedText>
                      <FittedText
                        shrink
                        maxLines={1}
                        className="mt-0.5 text-xs text-muted"
                      >
                        {lang.label}
                      </FittedText>
                    </View>
                    {selected ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={Palette.indiaGreen}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
