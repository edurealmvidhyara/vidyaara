/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,vue}", // Adjust based on your file structure
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "Oxygen",
          "Ubuntu",
          "Cantarell",
          '"Fira Sans"',
          '"Droid Sans"',
          '"Helvetica Neue"',
          "sans-serif",
        ],
        mono: [
          "source-code-pro",
          "Menlo",
          "Monaco",
          "Consolas",
          '"Courier New"',
          "monospace",
        ],
      },
      scale: {
        108: "1.08",
      },
      colors: {
        "custom-black": "#1c1d1f",
        "custom-bg": "#f7f9fa",
        purple: {
          25: "#faf5ff",
          50: "#f3e8ff",
          100: "#e9d5ff",
          200: "#d8b4fe",
          300: "#c084fc",
          400: "#a855f7",
          500: "#9333ea",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
      },
      spacing: {
        6.4: "6.4rem",
        3.2: "3.2rem",
        2.4: "2.4rem",
        1.6: "1.6rem",
        0.8: "0.8rem",
        0.4: "0.4rem",
      },
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
  ],
};
