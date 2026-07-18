// App colors. Two palettes (light/dark) with the same keys.
// - For classNames, use the tailwind tokens (bg-card, text-ink, ...) which flip
//   automatically via CSS variables.
// - For JS values (icon color, inline style) that must flip, use
//   useThemeColors(); COLORS stays the static light palette for spots that
//   don't need to react (or are always over imagery).
import { useColorScheme } from "nativewind";

export type Palette = {
  accent: string;
  accentSoft: string;
  accentTint: string;
  accentBorder: string;
  ink: string;
  paper: string;
  card: string;
  line: string;
  muted: string;
  gold: string;
  neutral: string;
};

export const LIGHT: Palette = {
  accent: "#F4522A",
  accentSoft: "#FFE9E8",
  accentTint: "#FFF3F0",
  accentBorder: "#FDCBC0",
  ink: "#1C1917",
  paper: "#FAF7F2",
  card: "#FFFFFF",
  line: "#E9E2D6",
  muted: "#8A8378",
  gold: "#E8A23D",
  neutral: "#999999",
};

export const DARK: Palette = {
  accent: "#F4522A",
  accentSoft: "#3C1E1A",
  accentTint: "#301A16",
  accentBorder: "#5A2D26",
  ink: "#EDEDED",
  paper: "#121212",
  card: "#1E1E1E",
  line: "#3A3A3A",
  muted: "#969188",
  gold: "#E8A23D",
  neutral: "#8A8A8A",
};

// Static light palette (backwards-compat; use useThemeColors() to react).
export const COLORS = LIGHT;

// Dark translucent scrim for controls floating over photos (both themes).
export const SCRIM = "rgba(28,25,23,0.55)";

// Reactive palette — colors flip with the active theme.
export function useThemeColors() {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? DARK : LIGHT;
}
