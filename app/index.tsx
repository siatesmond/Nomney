import { useAuthContext } from "@/hooks/use-auth-context";
import { Redirect } from "expo-router";

export default function Index() {
    const { isLoggedIn, isLoading } = useAuthContext();

    if (isLoading) return null;
    return <Redirect href={isLoggedIn ? "/home" : "/login"} />;
}