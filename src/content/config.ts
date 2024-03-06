import { z, defineCollection, reference } from 'astro:content'
import { polarArticleSchema } from '@polar-sh/astro'

const tags = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
  }),
})

const posts = defineCollection({
  type: 'content',
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      image: image(),
      date: z.date(),
      description: z.string().optional(),
      tags: z.array(reference('tags')),
      polar: z
        .intersection(
          polarArticleSchema,
          z.object({
            include_subtitle: z.boolean().optional(),
            include_image: z.boolean().optional(),
          }),
        )
        .optional(),
    }),
})

export const collections = {
  tags,
  posts,
}
