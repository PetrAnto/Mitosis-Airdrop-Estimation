// postcss.config.cjs
module.exports = {
  plugins: {
    // ← The Tailwind “PostCSS entrypoint”
    '@tailwindcss/postcss': {},
    // ← Hobbyist bonus: vendor prefixes
    autoprefixer: {},
  },
}
