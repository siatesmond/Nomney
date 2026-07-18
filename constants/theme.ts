// All app colors live here. Use these in JS code (icon color, style objects).
// For classNames, use the matching tailwind tokens instead (bg-accent, text-ink, etc).
export const COLORS = {
  accent: "#F4522A", // main orange
  accentSoft: "#FFE9E8", // light orange background (tag pills)
  accentTint: "#FFF3F0", // even lighter orange (selected chips)
  accentBorder: "#FDCBC0", // border for the light chips

  ink: "#1C1917", // near-black text
  paper: "#FAF7F2", // off-white background
  line: "#E9E2D6", // divider lines
  muted: "#8A8378", // grey secondary text
  gold: "#E8A23D", // rating stars

  neutral: "#999", // grey for inactive icons
} as const;

// Dark see-through colour for buttons floating over photos.
export const SCRIM = "rgba(28,25,23,0.55)";
