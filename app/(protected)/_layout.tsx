import { Stack } from "expo-router";
import { userAuthStore } from "../stores/userAuthStore";

export default function ProtectedLayout() {
    const isAuthenticated = userAuthStore((state) => state.isAuthenticated);
    return (
        <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
        </Stack>
    );
}
