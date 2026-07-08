/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14171F",
        paper: "#FAFAF8",
        "paper-dim": "#F0EFEA",
        forest: "#2E5E4E",
        brick: "#8B3A3A",
        slate: "#5B6B8C",
        rule: "#D8D5CC",
        "rule-dark": "#B8B4A8",
      },
      fontFamily: {
        serif: ["Source Serif 4", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      maxWidth: {
        report: "760px",
      },
    },
  },
  plugins: [],
}