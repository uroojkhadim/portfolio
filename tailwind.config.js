/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          light: '#f8fafc',
          dark: '#0b0f19',
        },
        card: {
          light: 'rgba(255, 255, 255, 0.72)',
          dark: 'rgba(15, 23, 42, 0.65)',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(15, 23, 42, 0.08)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.35)',
        glow: '0 0 40px rgba(99, 102, 241, 0.15)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
