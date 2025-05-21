// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Vite’s entry HTML
    './index.html',

    // Anything in public/ (e.g. markdown templates, static HTML snippets)
    './public/**/*.{html,md}',

    // All of your React code
    './src/**/*.{cjs,js,jsx,ts,tsx,html}',
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
