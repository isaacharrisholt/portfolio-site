/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        'middle-expand': 'minmax(0, 1fr) auto minmax(0, 1fr)'
      },
      colors: {
        surface: '#181a1f',
        primary: '#1a1c22',
        'accent-blue': '#50c5d9',
        'accent-red': '#fb5f66'
      }
    }
  },
  plugins: []
}
