import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel/static'
import tailwind from '@astrojs/tailwind'
import mdx from '@astrojs/mdx'

import sitemap from '@astrojs/sitemap'

// https://astro.build/config
export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [tailwind(), mdx(), sitemap()]
})
