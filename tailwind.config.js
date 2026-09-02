/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // TaaS Solutions Brand Colors
        navy: {
          DEFAULT: '#092B5A',
          50: '#E8ECF2',
          100: '#D1D9E5',
          200: '#A3B3CB',
          300: '#758DB1',
          400: '#476797',
          500: '#092B5A',
          600: '#072248',
          700: '#051A36',
          800: '#041124',
          900: '#020912',
        },
        teal: {
          DEFAULT: '#00A7A7',
          50: '#E6F7F7',
          100: '#CCEFEF',
          200: '#99DFDF',
          300: '#66CFCF',
          400: '#33BFBF',
          500: '#00A7A7',
          600: '#008686',
          700: '#006464',
          800: '#004343',
          900: '#002121',
        },
        gold: {
          DEFAULT: '#E2A72E',
          50: '#FDF6E9',
          100: '#FBEDD3',
          200: '#F7DBA7',
          300: '#F3C97B',
          400: '#EFB84F',
          500: '#E2A72E',
          600: '#B58625',
          700: '#88641C',
          800: '#5B4312',
          900: '#2E2109',
        },
        'soft-teal': '#EAF5F5',
        'light-grey': '#F3F5F7',
        'dark-text': '#1F2D3D',
      },
    },
  },
  plugins: [],
};
