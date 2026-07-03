import { useAuthContext } from "@/hooks/use-auth-context";
import AuthProvider from "@/providers/auth-provider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, useSegments } from "expo-router"; // Added useSegments
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuthContext();
  const segments = useSegments(); // Track current route segments

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {});
      }, 50);
    }
  }, [isLoading]);

  if (isLoading) return null;

  // Determine if user is currently in Reset Password process
  const isResettingPassword =
    segments.includes("reset-password") ||
    segments.includes("password-success");

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Temp pass false to protected guard, to prevent directly navigating to "Home" */}
      <Stack.Protected guard={isResettingPassword ? false : isLoggedIn}>
        <Stack.Screen name="(protected)" />
      </Stack.Protected>

      <Stack.Protected guard={isResettingPassword ? true : !isLoggedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
