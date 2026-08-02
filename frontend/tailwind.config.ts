import type { Config } from "tailwindcss";

// NOTE: This is a Phase 1 baseline. Phase 5 will flesh this out with the
// full VectrazAI brand palette and the 4-theme system (light / dark /
// + 2 additional themes), driven by a `data-theme` attribute on <html>
// combined with CSS variables, so every page/component can react to
// theme changes without prop-drilling.
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#b3ccff",
          300: "#80a8ff",
          400: "#4d7fff",
          500: "#2456ff", // primary VectrazAI blue
          600: "#1a3fd6",
          700: "#152fa8",
          800: "#10237d",
          900: "#0b1857",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
    },
  },
  plugins: [],
};

export default config;
