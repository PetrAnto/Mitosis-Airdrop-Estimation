// postcss.config.cjs
module.exports = {
  plugins: {
    // ← the new Tailwind “PostCSS entrypoint”
    '@tailwindcss/postcss': {},
    // ← vendor prefixes
    autoprefixer: {},
  },
}
