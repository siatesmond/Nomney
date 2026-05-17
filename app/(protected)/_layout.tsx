import { useAuth } from '@/providers/AuthProvider';
import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  // Still checking if a session exists — don't redirect yet
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#F4522A" />
      </View>
    );
  }

  // No session — send them to login
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Logged in — render the tabs
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}