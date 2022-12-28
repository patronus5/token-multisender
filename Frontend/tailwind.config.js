module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        "29rem": "29rem",
        '22%': '22%',
        '49%': '49.5%'
      },
      maxWidth: {
        "26rem": "26rem",
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      colors: {
        'primary': '#252831',
        'yellow': '#FFE804',
        'light-gray': '#3B3E46',
        'light-gray-lighter': "#4F5259"
      },
      fontSize: {
        'xt': '0.5rem'
      },
      screens: {
        'desktop-min': {
          'max': '1024px'
        },
        'mini-phone': {
          'max': '375px'
        }
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}