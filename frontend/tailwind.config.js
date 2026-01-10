/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-gradient-to-br',
    'from-indigo-50',
    'from-indigo-100',
    'from-indigo-500',
    'from-indigo-600',
    'via-white',
    'to-purple-50',
    'to-purple-100',
    'to-purple-600',
    'text-indigo-600',
    'text-purple-600',
    'bg-white',
    'text-gray-400',
    'text-gray-500',
    'text-gray-600',
    'text-gray-900',
    'border-gray-100',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
