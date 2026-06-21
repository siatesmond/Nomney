import { Stack } from "expo-router";

export default function ProtectedLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="new"
        options={{
          presentation: "modal",
          gestureEnabled: false,
          animation: "slide_from_bottom",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
