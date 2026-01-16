import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwind from '@astrojs/tailwind'
import vercel from '@astrojs/vercel'
import { defineConfig } from 'astro/config'

import svelte from '@astrojs/svelte'

// https://astro.build/config
export default defineConfig({
  output: 'server',
  prefetch: true,
  experimental: {
    clientPrerender: true,
  },
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
})
