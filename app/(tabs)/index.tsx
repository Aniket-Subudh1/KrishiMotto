import { Image } from 'expo-image';
import { Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-background px-6 pb-[88px]">
      <View className="w-full max-w-[360px] flex-1 items-center justify-center self-center">
        <View className="h-[173px] w-[260px]">
          <Image
            source={require('@/assets/images/logo.png')}
            style={{ width: '100%', height: '100%' }}
            contentFit="contain"
          />
        </View>
        <Text className="mb-2 mt-7 w-full text-center text-[32px] font-bold tracking-[0.3px] text-indigo">
          KrishiMotto
        </Text>
        <Text className="w-full text-center text-[17px] font-medium leading-6 text-india-green">
          Your land, your data
        </Text>
      </View>
    </View>
  );
}
