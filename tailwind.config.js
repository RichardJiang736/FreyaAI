module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'manrope': ['Manrope', 'sans-serif'],
        'mono': ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        // Natural green palette
        'fresh-green': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Natural purple palette
        'fresh-purple': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Soft natural accents
        'soft-mint': '#a8e6cf',
        'soft-lavender': '#d5a6e0',
        'sky-blue': '#b8e0f9',
        'pale-yellow': '#fffac8',
      },
    },
  },
  plugins: [],
}