import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#f97316",
          50: "#FBE9E7",
          100: "#FFCCBC",
          200: "#FFAB91",
          300: "#FF8A65",
          400: "#FF7043",
          500: "#f97316",
          600: "#F4511E",
          700: "#E64A19",
          800: "#D84315",
          900: "#BF360C",
        },

        background: {
          footer: "#002F35",
        },
        wallet: {
          recharge: {
            DEFAULT: "#EFF6FF",
            text: "#1E40AF",
            icon: "#2563EB",
          },
          withdraw: {
            DEFAULT: "#ECFDF5",
            text: "#064E3B",
            icon: "#10B981",
          },
        },
      },
    },
    fontFamily: {
      sans: ["Funnel Display", "sans-serif"], // Funnel Display is now the default sans font
    },
    animation: {
      "spin-slow": "spin 3s linear infinite",
    },
  },
  darkMode: "class",
  plugins: [heroui({})],
};
