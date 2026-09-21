/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saulo: {
          dark: '#0B1528',
          card: '#111F38',
          blue: '#1E3E62',
          accent: '#008DDA',
          cyan: '#41C9E2',
        },
        cba: {
          navy: '#0E273C',
          deep: '#091A29',
          primary: '#0284C7',
          light: '#38BDF8',
          soft: '#E0F2FE',
          accent: '#0EA5E9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
