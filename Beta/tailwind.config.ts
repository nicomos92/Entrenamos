import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#006591",
        secondary: "#006398",
        background: "#F8F9FF",
        surface: "#E5EEFF",
        "surface-glass": "rgba(255, 255, 255, 0.4)",
        "surface-container": "#E5EEFF",
        "surface-container-high": "#DCE9FF",
        "text-primary": "#0B1C30",
        "text-muted": "#3E4850",
        accent: "#DE8712",
        "status-active": "#22C55E",
        "status-urgent": "#EF4444",
        "status-attention": "#F59E0B",
      },
      boxShadow: {
        glow: "0 18px 48px rgba(0, 99, 152, 0.2)",
        lift: "0 18px 45px rgba(0, 99, 152, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
