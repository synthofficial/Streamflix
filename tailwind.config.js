import colors from 'tailwindcss/colors';

module.exports = {
  darkMode: true, // or 'media' or 'class'
  mode: 'jit',
  content: ['./src/renderer/**/*.{js,jsx,ts,tsx}', './src/renderer/pages/**/*.{js,jsx,ts,tsx}', './src/components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      
    },
  },
  variants: {
    extend: {},
  },
  // eslint-disable-next-line global-require
  plugins: [],
};
