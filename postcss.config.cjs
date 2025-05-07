// postcss.config.cjs
module.exports = {
  plugins: {
    // Use the standalone PostCSS plugin entrypoint:
    '@tailwindcss/postcss': {},
    // And autoprefixer for vendor prefixes:
    autoprefixer: {},
  }
}
