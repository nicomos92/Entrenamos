import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta segun Documentación/01 - BrandBook.md.
        // primary/secondary/soft se arman a partir de variables CSS con los
        // canales R G B (ver globals.css) para que cada entrenador pueda
        // personalizarlas Y para que sigan soportando modificadores de
        // opacidad de Tailwind (bg-secondary/20, etc). El valor por defecto
        // es el fallback si la variable no está definida.
        primary: "rgb(var(--brand-primary-rgb, 22 163 74) / <alpha-value>)",
        secondary: "rgb(var(--brand-secondary-rgb, 34 197 94) / <alpha-value>)",
        soft: "rgb(var(--brand-soft-rgb, 220 252 231) / <alpha-value>)",
        background: "#F8FAFC",
        surface: "#DCFCE7",
        "surface-glass": "rgba(255, 255, 255, 0.4)",
        "surface-container": "#DCFCE7",
        "surface-container-high": "#BBF7D0",
        "text-primary": "#0F172A",
        "text-muted": "#64748B",
        accent: "#0EA5E9",
        "status-active": "#16A34A",
        "status-urgent": "#DC2626",
        "status-attention": "#F59E0B",
        "status-info": "#0EA5E9",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        brand: "12px",
      },
      boxShadow: {
        glow: "0 18px 48px rgba(22, 163, 74, 0.22)",
        lift: "0 18px 45px rgba(15, 23, 42, 0.08)",
        soft: "0 8px 24px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
