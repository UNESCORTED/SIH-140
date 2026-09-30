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
        neutral: {
          950: '#050505',
          900: '#0A0A0A',
          850: '#111111',
          800: '#171717',
          750: '#212121',
          700: '#2A2A2A',
          600: '#404040',
          500: '#737373',
          400: '#A3A3A3',
          300: '#D4D4D4',
          200: '#E5E5E5',
          100: '#F5F5F5',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderColor: {
        subtle: 'rgba(255, 255, 255, 0.08)',
        moderate: 'rgba(255, 255, 255, 0.14)',
        strong: 'rgba(255, 255, 255, 0.25)',
      },
      backgroundColor: {
        app: '#050505',
        surface: '#0C0C0C',
        elevated: '#141414',
      }
    },
  },
  plugins: [],
}
