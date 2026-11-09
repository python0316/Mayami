/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          teal: '#21ABBE',
          'teal-hover': '#1B8E9E',
          dark: '#020106',
          yellow: '#FFB800',
        },
        darkBg: '#0A0A0A',
        darkCard: '#171717',
        darkBorder: '#262626',
        darkMuted: '#1F1F23',
      },
      fontFamily: {
        sans: ['Google Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'mall': '0 2px 10px rgba(0, 0, 0, 0.06)',
        'mall-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'dark-mall': '0 2px 10px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
