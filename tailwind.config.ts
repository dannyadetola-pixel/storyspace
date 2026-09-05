import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        app: {
          bg: "#F5F1E8",
          "bg-dark": "#1C1815",
          surface: "#FFFFFF",
          "surface-dark": "#26211D",
          text: "#1E1B16",
          "text-dark": "#EDE7DD",
          primary: "#1D7A4A", // brand green
          "primary-dark": "#2E9960",
          secondary: "#8C6212", // amber — reserved for books/chapters
          "secondary-dark": "#C4922E",
          verified: "#3B82F6", // reserved for the verification badge only
          "verified-dark": "#4E8FE8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
