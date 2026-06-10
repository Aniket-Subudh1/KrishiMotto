import { Text, View } from 'react-native';

export default function ExploreScreen() {
  return (
    <View className="flex-1 bg-background px-6 pb-[88px] pt-16">
      <Text className="mb-3 text-[28px] font-bold text-indigo">Explore</Text>
      <Text className="text-base leading-[26px] text-muted">
        Map-first land tools and regional crop data will live here.
      </Text>
    </View>
  );
}
