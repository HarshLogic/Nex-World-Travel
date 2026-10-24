/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: {
          50: '#F7F9FC',
          100: '#EEF2F6',
          200: '#E6EAF0',
          300: '#D0D7E2',
        },
        text: {
          primary: '#172033',
          secondary: '#667085',
          muted: '#98A2B3',
        },
        border: {
          DEFAULT: '#E6EAF0',
          light: '#F0F3F7',
          dark: '#D0D7E2',
        },
        accent: {
          primary: '#315EFB',
          'primary-hover': '#2448D8',
          'primary-light': '#EFF3FF',
          secondary: '#48B9B0',
          'secondary-hover': '#389B93',
          'secondary-light': '#EBF8F7',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 2px 10px rgba(23, 32, 51, 0.03), 0 1px 3px rgba(23, 32, 51, 0.02)',
        card: '0 10px 30px -5px rgba(23, 32, 51, 0.05), 0 2px 6px -1px rgba(23, 32, 51, 0.02)',
        'card-hover': '0 20px 40px -10px rgba(49, 94, 251, 0.08), 0 4px 12px -2px rgba(23, 32, 51, 0.04)',
        glow: '0 0 25px rgba(49, 94, 251, 0.25)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
