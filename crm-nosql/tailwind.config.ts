import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        nn: {
          50: "#f0f7ff", 100: "#e0effe", 200: "#b9dffd", 300: "#7cc5fb",
          400: "#36a7f6", 500: "#0c8ce7", 600: "#006fc5", 700: "#0158a0",
          800: "#064b84", 900: "#0b3f6e", 950: "#072849",
        },
        gold: { DEFAULT: "#C9A227", light: "#E8C547", dark: "#9A7B1A" },
      },
      boxShadow: {
        soft: "0 4px 24px -4px rgba(11,63,110,0.12)",
        glow: "0 0 40px -8px rgba(12,140,231,0.35)",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.45s ease-out",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
export default config;
