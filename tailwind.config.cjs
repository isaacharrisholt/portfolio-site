/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        'middle-expand': 'minmax(0, 1fr) auto minmax(0, 1fr)'
      }
    }
  },
  plugins: []
}
