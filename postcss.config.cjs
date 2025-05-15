// postcss.config.cjs
module.exports = {
  plugins: {
    // this is the new entrypoint for Tailwind’s PostCSS plugin
    '@tailwindcss/postcss': {},
    // autoprefix your CSS
    autoprefixer: {},
  },
}
