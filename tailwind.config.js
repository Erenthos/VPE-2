/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        secondary: "#9333ea",
        accent: "#06b6d4"
      },
    },
  },
  plugins: [],
};

