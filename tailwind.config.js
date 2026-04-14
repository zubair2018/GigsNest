/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        brand: '#e63946',
        'brand-dark': '#c0303b',
        accent: '#06d6a0',
      },
    },
  },
  plugins: [],
}
