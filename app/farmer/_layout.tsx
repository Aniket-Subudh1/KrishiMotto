import { Stack } from 'expo-router';

export default function FarmerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="land-boundary" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
