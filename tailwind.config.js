module.exports = {
  content: [
    // if you have an index.html in your project root:
    './index.html',

    // everything else in src/ that uses tailwind classes/component JSX
    './src/**/*.{js,jsx,ts,tsx,html}',

    // if you ever in the future import or write .md/.mdx with classes:
    //'./public/**/*.{html,md,mdx}'
  ],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: [
    require('@tailwindcss/typography'),
    // …any others
  ],
}
