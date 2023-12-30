import { z, defineCollection } from 'astro:content'
import mdx from '@astrojs/mdx'

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.date(),
    description: z.string().optional(),
  }),
})

export const collections = {
  posts,
}
