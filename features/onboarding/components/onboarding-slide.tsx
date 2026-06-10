import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

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
  const cardHeight = height - V_PAD * 2;
  const heroHeight = Math.round(cardHeight * 0.44);

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
        {/* Hero image */}
        <View style={{ height: heroHeight }} className="overflow-hidden">
          <Image
            source={slide.image}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />

          {/* Subtle gradient overlay for readability */}
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

        <View className="flex-1 px-5 pb-3.5 pt-4">
          <View className="mb-2.5 flex-row items-center gap-1.5">
            <View className="h-1.5 w-1.5 rounded-sm bg-india-green" />
            <Text
              className="font-condensed-bold text-[10px] tracking-[1.4px] text-india-green"
              style={
                Platform.OS === 'android' ? { includeFontPadding: false } : undefined
              }
            >
              {slide.tag.toUpperCase()}
            </Text>
          </View>

          <Text
            className="text-2xl font-bold leading-[30px] text-indigo"
            numberOfLines={1}
          >
            {slide.headline}
          </Text>
          <Text
            className="mt-px text-2xl font-bold leading-[30px] text-warm"
            numberOfLines={1}
          >
            {slide.accent}
          </Text>

          <Text
            className="mt-2.5 text-[13.5px] font-normal leading-5 text-muted"
            numberOfLines={3}
          >
            {slide.description}
          </Text>

          {slide.badge ? (
            <View
              className="mt-3.5 flex-row items-center gap-1.5 self-start rounded-sm border border-border bg-surface px-3 py-1.5"
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
              <Text className="text-[11px] font-semibold tracking-[0.2px] text-indigo">
                {slide.badge}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
