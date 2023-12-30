/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      gridTemplateColumns: {
        'default-layout':
          '[full-start] 1fr [content-start] minmax(0, 768px) [content-end] 1fr [full-end]',
      },
      gridTemplateRows: {
        'default-layout': '[site-start] 1fr [site-end]',
      },
      colors: {
        surface: {
          50: '#E5E7EB',
          100: '#CBCFD7',
          200: '#989EAF',
          300: '#666F84',
          400: '#414653',
          500: '#181A1F',
          600: '#14161A',
          700: '#0D0E11',
          800: '#090A0B',
          900: '#040506',
          950: '#020203',
        },
        primary: '#1a1c22',
        'accent-blue': '#50c5d9',
        'accent-red': '#fb5f66',
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            h1: {
              color: theme('colors.accent-blue'),
            },
            '--tw-prose-body': theme('colors.white'),
            '--tw-prose-headings': theme('colors.white'),
            '--tw-prose-lead': theme('colors.white'),
            '--tw-prose-links': theme('colors.accent-blue'),
            '--tw-prose-bold': theme('colors.white'),
            '--tw-prose-counters': theme('colors.white'),
            '--tw-prose-bullets': theme('colors.white'),
            '--tw-prose-hr': theme('colors.surface[400]'),
            '--tw-prose-quotes': theme('colors.white'),
            '--tw-prose-quote-borders': theme('colors.accent-red'),
            '--tw-prose-captions': theme('colors.white'),
            '--tw-prose-code': theme('colors.surface[50]'),
            '--tw-prose-pre-code': theme('colors.surface[50]'),
            '--tw-prose-pre-bg': theme('colors.surface[600]'),
            '--tw-prose-th-borders': theme('colors.surface[400]'),
            '--tw-prose-td-borders': theme('colors.white'),
          },
        },
      }),
    },
  },
  plugins: [
    require('@savvywombat/tailwindcss-grid-named-lines'),
    require('@tailwindcss/typography'),
  ],
}
