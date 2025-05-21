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
  safelist: [
  'bg-black', 'text-white', 'bg-gray-700', 'bg-gray-800', 'bg-gray-900',
  'text-gray-200', 'text-gray-300', 'text-gray-400', 'text-red-500', 
  'rounded-2xl', 'rounded-md', 'shadow-lg', 'font-sans', 'font-semibold', 'font-bold',
  'accent-blue-500', 'focus:ring-2', 'focus:ring-blue-500', 'placeholder-gray-500'
],
}
