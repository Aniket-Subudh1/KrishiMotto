import { useState } from 'react';
import {
  FlatList,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  View,
} from 'react-native';

import { ONBOARDING_SLIDES } from '../constants';
import { OnboardingSlide } from './onboarding-slide';
import { PaginationDots } from './pagination-dots';

const DOTS_HEIGHT = 44;

type Props = {
  width: number;
  height: number;
};

export function OnboardingCarousel({ width, height }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideHeight = height - DOTS_HEIGHT;

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  }

  return (
    <View style={{ width, height }}>
      <FlatList
        data={ONBOARDING_SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={{ width, height: slideHeight }}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        renderItem={({ item, index }) => (
          <OnboardingSlide
            slide={item}
            index={index}
            width={width}
            height={slideHeight}
          />
        )}
      />

      <View
        style={{ height: DOTS_HEIGHT }}
        className="items-center justify-center"
      >
        <PaginationDots count={ONBOARDING_SLIDES.length} activeIndex={activeIndex} />
      </View>
    </View>
  );
}
