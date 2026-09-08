/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#ECEFF4",
        ink: {
          DEFAULT: "#1D2233",
          soft: "#656C80"
        },
        brand: {
          primary: "#6C63FF",
          secondary: "#8F7BFF",
          teal: "#1FC8B8"
        }
      },
      fontFamily: {
        heading: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [],
}
