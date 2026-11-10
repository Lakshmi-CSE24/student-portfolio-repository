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
        background: {
          DEFAULT: '#090a0f',
          subtle: '#0e1017',
          surface: '#12141e',
          elevated: '#181b29',
          border: '#232738',
          hover: '#1e2235'
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          accent: '#7c3aed',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(99, 102, 241, 0.2)',
        'glow': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'glow-lg': '0 0 35px -5px rgba(99, 102, 241, 0.35)',
        'glow-accent': '0 0 25px -5px rgba(124, 58, 237, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.36)',
      },
      animation: {
        'pulse-subtle': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
