import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="scan" />
      <Stack.Screen name="connecting" />
      <Stack.Screen name="wifi-setup" />
      <Stack.Screen name="verifying" />
      <Stack.Screen name="name-device" />
      <Stack.Screen name="configure" />
      <Stack.Screen name="complete" />
    </Stack>
  );
}
