import { nextui } from "@nextui-org/theme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'doom-blue':'#2980b9',
        'doom-purple': '#8e44ad',
        'doom-red': '#e74c3c',
        'doom-red-2': '#c0392b',
        'doom-green': '#2ecc71',
        'doom-green-2': '#27ae60',
        'doom-yellow': '#f1c40f',
      }
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: { colors: { primary: { DEFAULT: "#000" } } },
        dark: {
          colors: {
            primary: { DEFAULT: "#fff", foreground: "#000" },
          },
        },
      },
    }),
  ],
};
