import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#07080C",
        ink: "#0E1018",
        line: "#1C2030",
        fog: "#8B93A7",
        snow: "#F4F6FB",
        mop: "#3DFF9A",
        "mop-dim": "#1FA864",
        warn: "#FFB020",
        hot: "#FF4D6A",
        sol: "#9945FF",
      },
      fontFamily: {
        display: ["var(--font-display)", "Space Grotesk", "system-ui", "sans-serif"],
        ui: ["var(--font-ui)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
        landing: ["var(--font-landing)", "Plus Jakarta Sans", "system-ui", "sans-serif"],
        editorial: ["var(--font-editorial)", "Fraunces", "Georgia", "serif"],
      },
      borderRadius: {
        card: "var(--ff-radius-card)",
        btn: "var(--ff-radius-btn)",
      },
      boxShadow: {
        card: "inset 0 1px 0 rgba(244, 246, 251, 0.04)",
        mop: "0 0 24px rgba(61, 255, 154, 0.28)",
        glass: "0 18px 50px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(244, 246, 251, 0.14)",
      },
      transitionDuration: {
        brand: "180ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
