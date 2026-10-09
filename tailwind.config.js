/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    // OCP: extend the design system through tokens without editing components.
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        mono: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        cyber: {
          dark: "rgb(var(--cyber-dark) / <alpha-value>)",
          surface: "rgb(var(--cyber-surface) / <alpha-value>)",
          text: "rgb(var(--cyber-text) / <alpha-value>)",
          muted: "rgb(var(--cyber-muted) / <alpha-value>)",
          cyan: "rgb(var(--cyber-cyan) / <alpha-value>)",
          purple: "rgb(var(--cyber-purple) / <alpha-value>)",
          border: "rgb(var(--cyber-border) / <alpha-value>)",
          "on-accent": "rgb(var(--cyber-on-accent) / <alpha-value>)",
          hover: "rgb(var(--cyber-hover) / <alpha-value>)",
        },
      },
      boxShadow: { "neon-cyan": "0 0 32px rgb(var(--cyber-cyan) / 0.16)" },
      keyframes: { reveal: { from: { opacity: "0", transform: "translateY(18px)" }, to: { opacity: "1", transform: "translateY(0)" } } },
      animation: { reveal: "reveal 800ms ease-out both" },
    },
  },
  plugins: [],
};
