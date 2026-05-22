/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      white: "#FFFFFF",
      black: "#000000",
      primary: "#1D4ED8",
      primaryHover: "#1E40AF",
      secondary: "#0F172A",
      background: "#F8FAFC",
      surface: "#FFFFFF",
      border: "#E2E8F0",
      textPrimary: "#0F172A",
      textSecondary: "#64748B",
      textMuted: "#94A3B8",
      success: "#16A34A",
      error: "#DC2626",
      warning: "#D97706",
      info: "#0284C7",
      blue: {
        50: "#EFF6FF",
        100: "#DBEAFE",
        600: "#2563EB",
        700: "#1D4ED8",
      },
      green: {
        50: "#F0FDF4",
        100: "#DCFCE7",
        700: "#15803D",
      },
      red: {
        50: "#FEF2F2",
        100: "#FEE2E2",
        700: "#B91C1C",
      },
      yellow: {
        50: "#FEFCE8",
        100: "#FEF3C7",
      },
      gray: {
        50: "#F9FAFB",
        100: "#F3F4F6",
        200: "#E5E7EB",
        700: "#374151",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui", "sans-serif"],
    },
    fontSize: {
      xs: ["12px", { lineHeight: "16px" }],
      sm: ["14px", { lineHeight: "20px" }],
      base: ["16px", { lineHeight: "24px" }],
      lg: ["18px", { lineHeight: "28px" }],
      xl: ["20px", { lineHeight: "28px" }],
      "2xl": ["24px", { lineHeight: "32px" }],
      "3xl": ["30px", { lineHeight: "36px" }],
      "4xl": ["36px", { lineHeight: "40px" }],
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    extend: {
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.08)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        fadeIn: "fadeIn 220ms ease-out forwards",
      },
    },
  },
  plugins: [],
};
