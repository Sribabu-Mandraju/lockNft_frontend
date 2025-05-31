/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-animation': 'linear-gradient(-45deg, #e73c7e, #23a6d5)',
      },
      backgroundSize: {
        '400': '400% 400%',
      },
      animation: {
        gradient: 'gradientMove 15s ease infinite',
        spin: 'spin 1s linear infinite',
        'spin-reverse': 'spin-reverse 1s linear infinite',
      },
      keyframes: {
        gradientMove: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        'spin-reverse': {
          to: { transform: 'rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
};
