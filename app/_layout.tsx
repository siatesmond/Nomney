import { AuthProvider, useAuth } from "@/providers/AuthProvider";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import "../global.css";

// Watches auth state and redirects accordingly
function AuthGuard() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inProtectedGroup = segments[0] === "(protected)";
    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && inProtectedGroup) {
      // Not logged in — send to login
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Logged in — send to app
      router.replace("/(protected)/(tabs)");
    }
  }, [isAuthenticated, isLoading, segments]);

  return null;
}

export default function Layout() {
  return (
    <AuthProvider>
      <AuthGuard />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}