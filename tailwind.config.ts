import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-lora)", "Georgia", "serif"],
      },
      colors: {
        app: {
          bg: "#F5F1E8",
          "bg-dark": "#000000",
          surface: "#FFFFFF",
          "surface-dark": "#000000",
          text: "#000000",
          "text-dark": "#FFFFFF",
          primary: "#1b7d00", // buttons, links, logo in light mode (darker for contrast)
          "primary-dark": "#1f8a00", // buttons, links, logo in dark mode
          secondary: "#8C6212",
          "secondary-dark": "#C4922E",
          verified: "#3B82F6",
          "verified-dark": "#4E8FE8",
        },
      },
    },
  },
  plugins: [],
};

export default config;