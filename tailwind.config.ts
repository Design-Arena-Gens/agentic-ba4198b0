import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF9900",
          dark: "#cc7a00",
          light: "#ffb84d",
        },
        accent: {
          DEFAULT: "#2563eb",
          muted: "#1d4ed8",
        },
        surface: "#f5f5f7",
        foreground: "#1f2933",
        muted: "#6b7280",
        border: "#e5e7eb",
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
      },
      fontFamily: {
        sans: ["Open Sans", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 10px 40px -25px rgba(15, 23, 42, 0.45)",
        focus: "0 0 0 4px rgba(255, 153, 0, 0.25)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 153, 0, 0.45)" },
          "50%": { boxShadow: "0 0 0 12px rgba(255, 153, 0, 0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.4s ease-out",
        pulseGlow: "pulseGlow 2s infinite",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
