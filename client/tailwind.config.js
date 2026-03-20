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
        primary: {
          50: '#f0f4ff',
          100: '#e1e9ff',
          200: '#c5d5ff',
          300: '#99b6ff',
          400: '#668eff',
          500: '#3366ff', // Telegram-style Blue
          600: '#2952cc',
          700: '#2040a6',
          800: '#193380',
          900: '#142966',
        },
        dark: {
          50: '#f6f6f7',
          100: '#e2e2e5',
          200: '#c2c2c9',
          300: '#9a9aa5',
          400: '#71717f',
          500: '#52525e',
          600: '#3e3e48',
          700: '#2e2e36',
          800: '#1a1a1f',
          900: '#0f0f13', // Deep Black/Grey
        }
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
