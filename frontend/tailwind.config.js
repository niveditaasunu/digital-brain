/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#05060a",       // page background — deep space, not pure black
        surface: "#0d0f18",    // panels
        line: "#1c2030",       // hairlines/borders
        signal: "#7dd3fc",     // cool cyan — cursor/selection accent
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
