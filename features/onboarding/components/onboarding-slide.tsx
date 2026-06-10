import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, View } from 'react-native';

import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';
import { useAppLocale } from '@/hooks/use-app-locale';

import type { OnboardingSlide as Slide } from '../constants';

type Props = {
  slide: Slide;
  index: number;
  width: number;
  height: number;
};

const H_PAD = 20;
const V_PAD = 8;

export function OnboardingSlide({ slide, index, width, height }: Props) {
  const { t, locale } = useAppLocale();
  const slideKey = `onboarding.slides.${slide.id}`;
  const cardHeight = height - V_PAD * 2;
  const heroHeight = Math.round(cardHeight * 0.4);
  const badge = slide.hasBadge ? t(`${slideKey}.badge`) : undefined;
  const tag = t(`${slideKey}.tag`);
  const displayTag = locale === 'en' ? tag.toUpperCase() : tag;

  return (
    <View
      style={{
        width,
        height,
        paddingHorizontal: H_PAD,
        paddingVertical: V_PAD,
      }}
    >
      <View
        style={{ height: cardHeight }}
        className="overflow-hidden rounded-sm border border-india-green bg-background"
      >
        <View style={{ height: heroHeight }} className="overflow-hidden">
          <Image
            source={slide.image}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />

          <LinearGradient
            colors={['transparent', 'rgba(26,54,93,0.25)']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
          />

          <View className="absolute left-4 top-3.5 z-10 rounded-sm border border-white/30 bg-black/25 px-2.5 py-1">
            <Text
              className="font-condensed-bold text-[11px] tracking-[0.8px] text-white"
              style={
                Platform.OS === 'android' ? { includeFontPadding: false } : undefined
              }
            >
              {String(index + 1).padStart(2, '0')}{' '}
              <Text className="opacity-55">/ 03</Text>
            </Text>
          </View>
        </View>

        <View className="h-0.5 w-full overflow-hidden">
          <LinearGradient
            colors={[Palette.saffron, Palette.indiaGreen]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{ flex: 1 }}
          />
        </View>

        <View className="min-h-0 flex-1 px-4 pb-3 pt-3.5">
          <View className="mb-2 flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 shrink-0 rounded-sm bg-india-green" />
            <FittedText
              shrink
              maxLines={1}
              className="font-condensed-bold text-[10px] tracking-[0.6px] text-india-green"
              style={
                Platform.OS === 'android' ? { includeFontPadding: false } : undefined
              }
            >
              {displayTag}
            </FittedText>
          </View>

          <FittedText
            fit
            shrink
            maxLines={2}
            minScale={0.72}
            className="text-[21px] font-bold leading-[26px] text-indigo"
          >
            {t(`${slideKey}.headline`)}
          </FittedText>
          <FittedText
            fit
            shrink
            maxLines={2}
            minScale={0.72}
            className="mt-0.5 text-[21px] font-bold leading-[26px] text-warm"
          >
            {t(`${slideKey}.accent`)}
          </FittedText>

          <FittedText
            shrink
            maxLines={4}
            className="mt-2 text-[13px] font-normal leading-[19px] text-muted"
          >
            {t(`${slideKey}.description`)}
          </FittedText>

          {badge ? (
            <View
              className="mt-2.5 max-w-full flex-row items-center gap-1.5 self-start rounded-sm border border-border bg-surface px-2.5 py-1.5"
              style={{
                shadowColor: Palette.indigo,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
              }}
            >
              <Image
                source={require('@/assets/icons/ai.png')}
                style={{ width: 13, height: 13 }}
                contentFit="contain"
              />
              <FittedText
                shrink
                maxLines={2}
                className="flex-1 text-[10.5px] font-semibold leading-[14px] tracking-[0.1px] text-indigo"
              >
                {badge}
              </FittedText>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
