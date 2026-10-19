import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#070b16",
          900: "#0d1426",
          800: "#15203a",
          700: "#1e2d4f",
        },
        gold: {
          200: "#f3e3c4",
          400: "#e4c48a",
          500: "#d4af7a",
          600: "#b89255",
        },
        paper: "#f6f1e8",
      },
      fontFamily: {
        cairo: ["Cairo", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(212, 175, 122, 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;
