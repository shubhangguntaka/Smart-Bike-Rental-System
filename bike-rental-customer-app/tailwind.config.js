/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.ts",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "#E8E6E1",
      },
      colors: {
        background: {
          DEFAULT: "#F8F7F4",
          dark: "#141416",
        },
        foreground: {
          DEFAULT: "#1A1F2E",
          dark: "#F4F4F5",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1F2E",
          dark: "#1E1E22",
          "dark-foreground": "#F4F4F5",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1A1F2E",
          dark: "#1E1E22",
          "dark-foreground": "#F4F4F5",
        },
        primary: {
          DEFAULT: "#7C9082",
          foreground: "#FFFFFF",
          dark: "#7C9082",
          "dark-foreground": "#0A0A0A",
        },
        secondary: {
          DEFAULT: "#E6E9DF",
          foreground: "#1A1F2E",
          dark: "#28282C",
          "dark-foreground": "#F4F4F5",
        },
        muted: {
          DEFAULT: "#EDEBE6",
          foreground: "#6B7280",
          dark: "#28282C",
          "dark-foreground": "#A1A1AA",
        },
        accent: {
          DEFAULT: "#CAD5C5",
          foreground: "#1A1F2E",
          dark: "#2E3D32",
          "dark-foreground": "#F4F4F5",
        },
        destructive: {
          DEFAULT: "#C73E3A",
          foreground: "#FFFFFF",
          dark: "#EF4444",
          "dark-foreground": "#FFFFFF",
        },
        border: {
          DEFAULT: "#E8E6E1",
          dark: "#36363A",
        },
        input: {
          DEFAULT: "#FFFFFF",
          dark: "#1E1E22",
        },
        ring: "#7C9082",
        chart: {
          1: "#7C9082",
          2: "#A0AA88",
          3: "#8B9D83",
          4: "#6B7280",
          5: "#E8E6E1",
        },
        sidebar: {
          DEFAULT: "#FAFAF8",
          foreground: "#1A1F2E",
          primary: "#7C9082",
          "primary-foreground": "#FFFFFF",
          accent: "#E8E6E1",
          "accent-foreground": "#1A1F2E",
          border: "#E8E6E1",
          ring: "#7C9082",
        },
      },
      fontFamily: {
        sans: ["Antic"],
        serif: ["Antic", "Georgia", "serif"],
        mono: ["JetBrainsMono"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "5.6px",
        md: "4.5px",
        lg: "5.6px",
        xl: "7.8px",
        "2xl": "10px",
        "3xl": "12.3px",
        "4xl": "14.5px",
        full: "9999px",
      },
      spacing: {
        "0.25": "1px",
        "0.5": "2px",
        "0.75": "3px",
      },
    },
  },
  plugins: [],
};