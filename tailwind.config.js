/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#111118',
          card: '#16161E',
        },
        accent: {
          1: '#7C3AED',
          2: '#EC4899',
          3: '#F97316',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
        },
      },
      boxShadow: {
        'glow-soft': '0 0 40px rgba(124,58,237,0.35)',
        'card-lg':
          '0 18px 45px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)',
      },
      borderRadius: {
        '3xl': '1.75rem',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translate3d(0, 20px, 0)' },
          '100%': { opacity: 1, transform: 'translate3d(0, 0, 0)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -12px, 0)' },
        },
        pulseSoft: {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.9 },
          '50%': { transform: 'scale(1.08)', opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-450px 0' },
          '100%': { backgroundPosition: '450px 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 0.7s ease-out forwards',
        float: 'float 6s ease-in-out infinite',
        pulseSoft: 'pulseSoft 2.8s ease-in-out infinite',
        gradientShift: 'gradientShift 12s ease infinite',
        shimmer: 'shimmer 1.6s linear infinite',
        marquee: 'marquee 24s linear infinite',
      },
    },
  },
  plugins: [],
};

