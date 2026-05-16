import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#06070a",
          900: "#0b0d13",
          850: "#11141d",
          800: "#161a25",
          700: "#202636"
        },
        accent: {
          blue: "#3b82f6",
          cyan: "#22d3ee",
          violet: "#8b5cf6",
          pink: "#ec4899"
        }
      },
      boxShadow: {
        glow: "0 0 60px rgba(59, 130, 246, 0.16)",
        card: "0 18px 60px rgba(0, 0, 0, 0.28)"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};

export default config;
