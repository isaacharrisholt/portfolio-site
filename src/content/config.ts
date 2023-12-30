import { z, defineCollection, reference } from 'astro:content'

const tags = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
  }),
})

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.date(),
    description: z.string().optional(),
    tags: z.array(reference('tags')),
  }),
})

export const collections = {
  tags,
  posts,
}
