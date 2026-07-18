// Stores the user's theme choice (Light / Dark / System) and persists it.
// NOTE: for now this only SAVES the preference — applying dark colors across
// the app is a separate step. Read `theme` here when you're ready to theme.
import AsyncStorage from "@react-native-async-storage/async-storage";
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
      if (v === "light" || v === "dark" || v === "system") setThemeState(v);
    });
  }, []);

  const setTheme = (t: ThemePref) => {
    setThemeState(t);
    AsyncStorage.setItem(STORAGE_KEY, t).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemePref = () => useContext(ThemeContext);
