import { useAuthContext } from "@/hooks/use-auth-context";
import { SplashScreen } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export function SplashScreenController() {
  const { isLoading } = useAuthContext();

  useEffect(() => {
    if (!isLoading) {
      const hide = async () => {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // Safe to ignore — modal screens don't have a splash registered
        }
      };
      hide();
    }
  }, [isLoading]);

  return null;
}
