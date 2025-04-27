/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./(tabs)/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        primaryBackground: "url('/images/primaryBackground.png')",
        dialougue: "url('/images/dialougue.png')",
        kripson: "url('/images/kripson.png')",
        iconButton: "url('/images/iconButton.png')",
        material: "url(/images/material.png)",
        loadingBackground: "url('/images/loadingBackground.png')",
        gameBackground: "url('/images/gameBackground.png')",
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
        },
      },
      fontFamily: {
        MachineStd: ["MachineStd"],
      },
    },
  },
  plugins: [],
};
