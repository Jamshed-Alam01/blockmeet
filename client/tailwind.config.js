/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0F1119",
        surface: "#1B1E29",
        surfaceHover: "#232733",
        border: "#2A2E3D",
        accent: "#6C5CE7",
        accentGlow: "#8B7FFF",
        success: "#2DD4A7",
        successGlow: "#00F5C4",
        textMuted: "#8B8D9B",
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(108, 92, 231, 0.25)",
        glowSuccess: "0 0 30px rgba(45, 212, 167, 0.25)",
      },
    },
  },
  plugins: [],
};