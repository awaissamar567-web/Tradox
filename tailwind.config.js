/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgBase: 'var(--bgBase)',
        bgSurface: 'var(--bgSurface)',
        bgElevated: 'var(--bgElevated)',
        bgOverlay: 'var(--bgOverlay)',
        accent: 'var(--accent)',
        accentDim: 'var(--accentDim)',
        accentGlow: 'var(--accentGlow)',
        textPrimary: 'var(--textPrimary)',
        textSecondary: 'var(--textSecondary)',
        textMuted: 'var(--textMuted)',
        greenPnl: 'var(--greenPnl)',
        redPnl: 'var(--redPnl)',
        customBorder: 'var(--customBorder)',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
        syne: ['Inter', 'sans-serif'],
        dmsans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
