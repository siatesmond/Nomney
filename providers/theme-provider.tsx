// Stores the user's theme choice (Light / Dark / System), persists it, and
// drives NativeWind's color scheme so the app's colors flip.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemePref = "light" | "dark" | "system";

const STORAGE_KEY = "themePref";

type ThemeContextValue = {
  theme: ThemePref;
  setTheme: (t: ThemePref) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<ThemePref>("system");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      const t =
        v === "light" || v === "dark" || v === "system" ? v : "system";
      setThemeState(t);
      colorScheme.set(t);
    });
  }, []);

  const setTheme = (t: ThemePref) => {
    setThemeState(t);
    colorScheme.set(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemePref = () => useContext(ThemeContext);
