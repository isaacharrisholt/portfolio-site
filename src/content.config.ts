import { defineCollection, reference, z } from 'astro:content'
import { glob } from 'astro/loaders'

const tags = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: './src/content/tags' }),
  schema: z.object({
    name: z.string(),
  }),
})

const posts = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      image: image(),
      date: z.date(),
      description: z.string().optional(),
      tags: z.array(reference('tags')),
    }),
})

export const collections = {
  tags,
  posts,
}
