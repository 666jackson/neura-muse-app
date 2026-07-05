/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#04050d',
        ice: '#7dd3fc',
        nova: '#f9a8d4',
        chrome: '#e8ecf4'
      },
      fontFamily: {
        display: ['Michroma', 'sans-serif'],
        body: ['Space Grotesk', 'Noto Sans TC', 'sans-serif']
      }
    }
  },
  plugins: []
};