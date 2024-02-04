import type { CollectionEntry } from 'astro:content'
import { PolarAPI, Configuration } from '@polar-sh/sdk'

function getPolarClient() {
  return new PolarAPI(
    new Configuration({
      accessToken: import.meta.env.POLAR_SH_KEY,
    }),
  )
}

/**
 * Replace relative image paths with absolute URLs
 */
function replaceImages(body: string) {
  return body.replaceAll('../../../public', 'https://ihh.dev')
}

export async function uploadToPolar(entries: CollectionEntry<'posts'>[]) {
  const entriesToUpload = entries.filter((entry) => !!entry.data.polar_sync)
  if (entriesToUpload.length === 0) {
    console.log('No entries to upload to Polar')
    return
  }

  const client = getPolarClient()
  const articles = await client.articles.list()

  // Check which articles already exist and which need to be created
  const articlesToUpdate = entriesToUpload.filter((entry) => {
    return articles.items?.some((article) => article.slug === entry.slug)
  })
  const articlesToCreate = entriesToUpload.filter((entry) => {
    return !articles.items?.some((article) => article.slug === entry.slug)
  })

  console.log('Uploading to Polar')
  await Promise.all(
    articlesToUpdate.map(async (entry) => {
      console.log('Updating article', entry.slug)
      const article = articles.items!.find((article) => article.slug === entry.slug)!
      return await client.articles.update({
        id: article.id,
        articleUpdate: {
          title: entry.data.title,
          body: replaceImages(entry.body),
        },
      })
    }),
  )

  await Promise.all(
    articlesToCreate.map(async (entry) => {
      console.log('Creating article', entry.slug)
      const createResponse = await client.articles.create({
        articleCreate: {
          title: entry.data.title,
          body: replaceImages(entry.body),
          published_at: entry.data.date.toISOString(),
          organization_id: import.meta.env.POLAR_SH_ORG_ID,
        },
      })

      // Update with slug
      return await client.articles.update({
        id: createResponse.id,
        articleUpdate: {
          slug: entry.slug,
        },
      })
    }),
  )
}