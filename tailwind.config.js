/* npx tailwindcss -i ./public/styles/input.css -o ./public/styles/output.css --watch */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.{html,pug,js,jade}"],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px',
    },
    fontFamily: {
      sans: ['Graphik', 'sans-serif'],
      serif: ['Merriweather', 'serif'],
    },
    extend: {
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      }
    }
  },
  plugins: [],
}


