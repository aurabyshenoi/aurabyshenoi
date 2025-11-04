/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sage-green': {
          DEFAULT: '#9CAF88',
          light: '#B8C5A6',
          dark: '#7A8F6B',
        },
        'brown': {
          DEFAULT: '#8B6F47',
          light: '#A68B6A',
          dark: '#6B5537',
        },
        'cream': '#FAF8F5',
        'off-white': '#F7F5F2',
        'warm-gray': '#E8E6E1',
        'text-dark': '#3A3A3A',
        'text-light': '#6B6B6B',
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}