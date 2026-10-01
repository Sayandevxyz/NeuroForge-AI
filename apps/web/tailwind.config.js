/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080B10",
        surface: "#0D121B",
        "surface-card": "#111827",
        "surface-border": "#1F2937",
        "surface-highlight": "#1E293B",
        primary: {
          DEFAULT: "#0066FF",
          hover: "#0052CC",
          glow: "rgba(0, 102, 255, 0.2)",
        },
        cyan: {
          accent: "#06B6D4",
          glow: "rgba(6, 182, 212, 0.2)",
        },
        emerald: {
          accent: "#10B981",
          glow: "rgba(16, 185, 129, 0.2)",
        },
        nvidia: {
          green: "#76B900",
          glow: "rgba(118, 185, 0, 0.2)",
        },
        nebius: {
          purple: "#7C3AED",
          blue: "#2563EB",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
      keyframes: {
        pulseSlow: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.4 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'pulse-slow': 'pulseSlow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2.5s infinite linear',
      },
    },
  },
  plugins: [],
};
