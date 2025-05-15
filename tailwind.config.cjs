// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',                  // your root HTML
    './public/**/*.{html,md}',       // anything you drop in public/
    './src/**/*.{js,jsx,ts,tsx,html}', // *all* your React components
  ],
  darkMode: 'class',  
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
