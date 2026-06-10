/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./views/**/*.ejs', './public/js/**/*.js'],
  theme: {
    extend: {
      colors: {
        primary: '#00daf8',
        'primary-container': '#009fb5',
        surface: '#121314',
        'surface-dim': '#121314',
        'surface-container-low': '#1b1c1d',
        'surface-container': '#1f2021',
        'surface-container-high': '#292a2b',
        'surface-container-highest': '#343536',
        'on-surface': '#e3e2e3',
        'on-primary': '#00363f',
        'on-primary-container': '#002f37',
      },
      fontFamily: {
        headline: ['Space Grotesk', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
        label: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',
        lg: '0.25rem',
        xl: '0.5rem',
        full: '0.75rem',
      },
    },
  },
  plugins: [],
};
