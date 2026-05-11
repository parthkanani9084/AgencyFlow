/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f3f0ff',
          100: '#ebe5ff',
          200: '#d9ceff',
          300: '#bea6ff',
          400: '#9d76ff',
          500: '#6C47FF',
          600: '#5c35f5',
          700: '#4d23e0',
          800: '#401dba',
          900: '#361a96',
        },
        accent: {
          50: '#fff4f0',
          100: '#ffe6da',
          200: '#ffc9b0',
          300: '#ffa07a',
          400: '#ff7d4a',
          500: '#FF6B35',
          600: '#e85520',
          700: '#c24015',
          800: '#9e3212',
          900: '#822b13',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.15s ease-out forwards',
        'slide-up': 'slideUp 0.2s ease-out forwards',
        'scale-in': 'scaleIn 0.15s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};