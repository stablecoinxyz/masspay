import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        mutedForeground: "#A1A1AA",
        border: "#27272A",
        card: "#18181B",
        cardForeground: "#FAFAFA",
        foreground: "#FAFAFA",
        background: "#09090B",
        secondaryBackground: "#18181B",
        secondary: "#E4E4E7",
        muted: "#27272A",
        accent: "#27272A",
        primary: "#7C3AED",
      },
      fontSize: {
        "3xl": "1.875rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
