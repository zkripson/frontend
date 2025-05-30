/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.{js,ts,jsx,tsx}",
    "./(tabs)/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        primaryBackground: "url('/images/primaryBackground.webp')",
        dialougue: "url('/images/dialougue.webp')",
        kripson: "url('/images/kripson.png')",
        iconButton: "url('/images/iconButton.webp')",
        material: "url(/images/material.webp)",
        loadingBackground: "url('/images/loadingBackground.webp')",
        gameBackground: "url('/images/gameBackground.webp')",
      },
      colors: {
        primary: {
          50: "#FCD8A5",
          100: "#7A2929",
          150: "#D5DBE1",
          200: "#C34B4B",
          250: "#20262D",
          300: "#44190C",
          350: "#445058",
          400: "#E8EBED",
          450: "#F3E4CE",
          500: "#8C5A0B40",
          550: "#565656",
          600: "#6C5940",
          650: "#87CF50",
          700: "#D9D9D9",
          750: "#FAD9BA",
          800: "#632918",
          850: "#5D656E",
          900: "#FABABA",
          950: "#631818",
          1000: "#FCA5A5",
          1050: "#BFFCA5",
          1100: "#101010",
          1200: "rgba(252, 216, 165, 0.12)",
        },
      },
      fontFamily: {
        MachineStd: ["MachineStd"],
      },
      keyframes: {
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-6px)" },
          "40%, 80%": { transform: "translateX(6px)" },
        },
        "pulse-opacity": {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.5" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        shake: "shake 0.4s ease-in-out",
        "pulse-opacity": "pulse-opacity 2s ease-in-out infinite",
      },
      screens: {
        bp1215: "1215px",
      },
    },
  },
  plugins: [],
};
