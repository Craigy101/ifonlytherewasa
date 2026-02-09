import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        surface: {
          DEFAULT: "#0A0A0A",
          raised: "#141414",
          overlay: "#1C1C1C",
          border: "#2A2A2A",
          hover: "#333333",
        },
        content: {
          DEFAULT: "#FAFAFA",
          secondary: "#A0A0A0",
          muted: "#666666",
          inverse: "#0A0A0A",
        },
        accent: {
          DEFAULT: "#FFFFFF",
          dim: "#E0E0E0",
        },
        reaction: {
          pay: "#22C55E",
          nice: "#3B82F6",
          meh: "#F59E0B",
          bad: "#EF4444",
        },
      },
      borderColor: {
        DEFAULT: "#2A2A2A",
      },
      ringColor: {
        DEFAULT: "#2A2A2A",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-subtle": "pulseSubtle 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
