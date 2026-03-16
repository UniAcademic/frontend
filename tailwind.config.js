/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", 
  theme: {
    extend: {
      colors: {
        primary: "#fba005", 
        accent: "#f59e0b", 
        secondary: "#1e293b", 
        "background-light": "#f8f7f5", 
        "background-dark": "#231c0f"
      }, 
      fontFamily: {
        sans: ["Roboto", "sans-serif"], 
        display: "Inter"
      }, 
      borderRadius: {
        DEFAULT: "0.25rem", 
        lg: "0.5rem", 
        xl: "0.75rem", 
        full: "9999px"
      }
    }
  },
  plugins: [],
}
