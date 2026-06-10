import { Link } from 'expo-router';
import { Text, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background p-5">
      <Text className="text-center text-2xl font-bold text-indigo">This is a modal</Text>
      <Link href="/" dismissTo className="mt-4 py-4">
        <Text className="text-center text-base font-semibold text-primary">Go to home screen</Text>
      </Link>
    </View>
  );
}
