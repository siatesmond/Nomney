import { useAuthContext } from "@/hooks/use-auth-context";
import { Redirect } from "expo-router";

export default function Index() {
    const { isLoggedIn, isLoading } = useAuthContext();

    // The AnimatedSplash in _layout covers the app while this resolves.
    if (isLoading) return null;
    return <Redirect href={isLoggedIn ? "/home" : "/login"} />;
}