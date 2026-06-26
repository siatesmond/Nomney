/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#F4522A",
          soft: "#FFE9E8",
          tint: "#FFF3F0",
          border: "#FDCBC0",
        },
        ink: "#1C1917",
        paper: "#FAF7F2",
        line: "#E9E2D6",
        muted: "#8A8378",
        gold: "#E8A23D",
      },
    },
  },
  plugins: [],
};