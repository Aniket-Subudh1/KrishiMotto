import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { ActivityIndicator, LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { FittedText } from '@/components/ui/fitted-text';
import { Text } from '@/components/ui/text';
import { Palette } from '@/constants/theme';

type SlideButtonProps = {
  label: string;
  hint?: string;
  onComplete: () => void;
  loading?: boolean;
  disabled?: boolean;
  resetKey?: number;
};

const TRACK_HEIGHT = 56;
const THUMB_SIZE = 48;
const TRACK_PADDING = 4;
const COMPLETE_THRESHOLD = 0.85;

export function SlideButton({
  label,
  hint,
  onComplete,
  loading = false,
  disabled = false,
  resetKey = 0,
}: SlideButtonProps) {
  'use no memo';
  const [trackWidth, setTrackWidth] = useState(0);
  const translateX = useSharedValue(0);
  const maxSlide = useSharedValue(0);
  const completed = useSharedValue(false);
  const startX = useSharedValue(0);

  const isInteractive = !loading && !disabled && trackWidth > 0;

  useEffect(() => {
    translateX.value = 0;
    completed.value = false;
    startX.value = 0;
  }, [resetKey, completed, startX, translateX]);

  useEffect(() => {
    maxSlide.value = Math.max(0, trackWidth - THUMB_SIZE - TRACK_PADDING * 2);
  }, [trackWidth, maxSlide]);

  function handleComplete() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onComplete();
  }

  function handleTrackLayout(event: LayoutChangeEvent) {
    setTrackWidth(event.nativeEvent.layout.width);
  }

  const pan = Gesture.Pan()
    .enabled(isInteractive)
    .activeOffsetX(6)
    .failOffsetY([-10, 10])
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      if (completed.value) {
        return;
      }

      const max = maxSlide.value;
      translateX.value = Math.max(0, Math.min(startX.value + event.translationX, max));
    })
    .onEnd(() => {
      if (completed.value) {
        return;
      }

      const max = maxSlide.value;

      if (max > 0 && translateX.value >= max * COMPLETE_THRESHOLD) {
        translateX.value = withSpring(max, { damping: 20, stiffness: 240 });
        completed.value = true;
        runOnJS(handleComplete)();
        return;
      }

      translateX.value = withSpring(0, { damping: 18, stiffness: 200 });
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="gap-2">
      <View
        className={`overflow-hidden rounded-2xl border bg-surface ${
          disabled ? 'border-border opacity-50' : 'border-india-green/50'
        }`}
        style={{ height: TRACK_HEIGHT }}
        onLayout={handleTrackLayout}
      >
        <View className="absolute inset-0 items-center justify-center px-14">
          {loading ? (
            <ActivityIndicator color={Palette.indiaGreen} />
          ) : (
            <FittedText
              shrink
              maxLines={1}
              minScale={0.75}
              className="text-center text-[14px] font-semibold text-muted"
            >
              {label}
            </FittedText>
          )}
        </View>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                left: TRACK_PADDING,
                top: TRACK_PADDING,
                width: THUMB_SIZE,
                height: THUMB_SIZE,
                borderRadius: 14,
                overflow: 'hidden',
              },
              thumbStyle,
            ]}
          >
            <LinearGradient
              colors={[Palette.saffron, Palette.indiaGreen]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              )}
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      </View>

      {hint ? (
        <Text className="text-center text-[12px] leading-[18px] text-muted">{hint}</Text>
      ) : null}
    </View>
  );
}
