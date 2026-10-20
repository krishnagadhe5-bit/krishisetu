/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        agri: {
          50: '#f2f9f5',
          100: '#e0f3e7',
          200: '#c2e7d1',
          300: '#94d5b2',
          400: '#60bc8e',
          500: '#3a9e70',
          600: '#2a7f58',
          700: '#226447',
          800: '#1d503a',
          900: '#194231',
          950: '#0a241a',
        },
        harvest: {
          50: '#fdfbf4',
          100: '#faf3de',
          200: '#f5e4b7',
          300: '#eecd85',
          400: '#e4b055',
          500: '#d5912c',
          600: '#ba7320',
          700: '#94531b',
          800: '#78431c',
          900: '#64381b',
        },
        earth: {
          50: '#faf9f6',
          100: '#f3f1ec',
          200: '#e6e2d8',
          300: '#d4ccc0',
          400: '#b5a997',
          500: '#988a75',
          600: '#7d705c',
          700: '#655a4b',
          800: '#534b3f',
          900: '#463f36',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 2px rgba(16, 40, 24, 0.04), 0 1px 1px rgba(16, 40, 24, 0.02)',
        'card': '0 2px 8px -2px rgba(16, 40, 24, 0.05), 0 8px 20px -4px rgba(16, 40, 24, 0.04)',
        'card-hover': '0 8px 24px -4px rgba(16, 40, 24, 0.08), 0 20px 32px -8px rgba(16, 40, 24, 0.06)',
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
