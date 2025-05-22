module.exports = {
  content: [
    "./index.html",
    "./public/**/*.{html,md}",
    "./src/**/*.{js,jsx,ts,tsx,html}"
  ],
  safelist: [
    "bg-black",
    "bg-gray-900",
    "bg-gray-800",
    "bg-gray-700",
    "bg-test123",
    "text-white",
    "text-gray-200",
    "text-gray-300",
    "text-gray-400",
    "text-red-500",
    "rounded-2xl",
    "rounded-md",
    "shadow-lg",
    "font-sans",
    "font-semibold",
    "font-bold",
    "accent-blue-500",
    "focus:ring-2",
    "focus:ring-blue-500",
    "placeholder-gray-500"
  ],
  darkMode: "class",
  theme: {
    extend: {}
  },
  plugins: [
    require("@tailwindcss/typography")
  ]
}
