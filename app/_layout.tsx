import { AnimatedSplash } from "@/components/AnimatedSplash";
import { useAuthContext } from "@/hooks/use-auth-context";
import AuthProvider from "@/providers/auth-provider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack, useSegments } from "expo-router"; // Added useSegments
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import "../global.css";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuthContext();
  const segments = useSegments(); // Track current route segments
  const [splashDone, setSplashDone] = useState(false);

  // Hide the native splash as soon as JS is up; the animated splash below then
  // covers the app until it's ready, so there's no blank flash in between.
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Determine if user is currently in Reset Password process.
  // Cast to string[]: expo-router types useSegments() so .includes() with a
  // plain string otherwise trips a "not assignable to never" error.
  const currentSegments = segments as string[];
  const isResettingPassword =
    currentSegments.includes("reset-password") ||
    currentSegments.includes("password-success");

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Temp pass false to protected guard, to prevent directly navigating to "Home" */}
        <Stack.Protected guard={isResettingPassword ? false : isLoggedIn}>
          <Stack.Screen name="(protected)" />
        </Stack.Protected>

        <Stack.Protected guard={isResettingPassword ? true : !isLoggedIn}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
      </Stack>

      {!splashDone && (
        <AnimatedSplash
          loading={isLoading}
          onFinish={() => setSplashDone(true)}
        />
      )}
    </>
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
