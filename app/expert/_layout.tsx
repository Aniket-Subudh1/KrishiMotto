import { Stack } from 'expo-router';

export default function ExpertLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="pending" />
    </Stack>
  );
}
