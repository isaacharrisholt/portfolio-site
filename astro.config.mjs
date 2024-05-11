import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel/serverless'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'

import svelte from '@astrojs/svelte'

// https://astro.build/config
export default defineConfig({
  output: 'hybrid',
  adapter: vercel({
    speedInsights: {
      enabled: true,
    },
    webAnalytics: {
      enabled: true,
    },
    imageService: true,
  }),
  integrations: [tailwind(), mdx(), sitemap(), svelte()],
  site: 'https://www.ihh.dev',
  redirects: {
    '/cv': '/resume.pdf',
  },
})
