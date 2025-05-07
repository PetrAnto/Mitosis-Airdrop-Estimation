// postcss.config.js
import postcssTailwind from '@tailwindcss/postcss'
import autoprefixer from 'autoprefixer'

export default {
  plugins: {
    // Use the new package name here:
    [postcssTailwind]: {},
    autoprefixer: {},
  },
}
