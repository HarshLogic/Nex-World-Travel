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
        // Luxury coastal travel palette
        brand: {
          navy: '#102A43',      // Midnight Navy - Primary brand authority
          'navy-dark': '#0B1D2E',
          'navy-light': '#1A3B5C',
          teal: '#087F8C',      // Ocean Teal - Secondary travel accent
          'teal-dark': '#066570',
          'teal-light': '#E6F4F6',
          gold: '#C6A66B',      // Champagne Gold - Luxury warmth & accolades
          'gold-light': '#FDF9F0',
          slate: '#243447',     // Deep Slate for solid secondary accents
        },
        surface: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          warm: '#FAF8F5',      // Warm Ivory / Sand editorial surface
        },
        text: {
          primary: '#0F172A',   // Slate 900 - High-contrast readable black
          secondary: '#475569', // Slate 600 - Readable body text
          muted: '#94A3B8',     // Slate 400 - Secondary captions
        },
        border: {
          DEFAULT: '#E2E8F0',
          light: '#F1F5F9',
          dark: '#CBD5E1',
        },
        // Backward-compatible accent alias mapped to Coastal Luxury palette
        accent: {
          primary: '#087F8C',               // Ocean Teal
          'primary-hover': '#066570',
          'primary-light': '#E6F4F6',
          secondary: '#C6A66B',             // Champagne Gold
          'secondary-hover': '#A88B54',
          'secondary-light': '#FDF9F0',
          navy: '#102A43',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(16, 42, 67, 0.04), 0 1px 2px rgba(16, 42, 67, 0.02)',
        card: '0 4px 20px -2px rgba(16, 42, 67, 0.06), 0 2px 6px -1px rgba(16, 42, 67, 0.03)',
        'card-hover': '0 16px 32px -6px rgba(16, 42, 67, 0.10), 0 4px 12px -2px rgba(16, 42, 67, 0.04)',
        elevated: '0 20px 40px -12px rgba(16, 42, 67, 0.14), 0 6px 16px -4px rgba(16, 42, 67, 0.06)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
