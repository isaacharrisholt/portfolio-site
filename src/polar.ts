import type { CollectionEntry } from 'astro:content'
import { PolarAPI, Configuration, type Article } from '@polar-sh/sdk'

export function getPolarClient() {
  return new PolarAPI(
    new Configuration({
      accessToken: import.meta.env.POLAR_SH_KEY,
    }),
  )
}

async function getArticles(client: PolarAPI) {
  const articles: Article[] = []
  let page = 1

  while (true) {
    const response = await client.articles.search({
      organizationName: 'isaacharrisholt',
      showUnpublished: true,
      page,
      platform: 'github',
      limit: 100,
    })
    articles.push(...response.items!)
    if (response.pagination?.max_page && page < response.pagination.max_page) {
      page++
    } else {
      break
    }
  }

  return articles
}

/**
 * Replace relative image paths with absolute URLs
 */
function replaceImages(body: string) {
  return body.replaceAll('../../../public', 'https://ihh.dev')
}

function processBody(entry: CollectionEntry<'posts'>) {
  let body = entry.body
  body = `## ${entry.data.subtitle}\n\n![](https://ihh.dev${entry.data.image.src})\n${body}`
  return replaceImages(body)
}

export async function uploadToPolar(entries: CollectionEntry<'posts'>[]) {
  const entriesToUpload = entries.filter((entry) => !!entry.data.polar_sync)
  if (entriesToUpload.length === 0) {
    console.log('No entries to upload to Polar')
    return
  }

  const client = getPolarClient()
  const articles = await getArticles(client)

  // Check which articles already exist and which need to be created
  const articlesToUpdate = entriesToUpload.filter((entry) => {
    return articles.some((article) => article.slug === entry.slug)
  })
  const articlesToCreate = entriesToUpload.filter((entry) => {
    return !articles.some((article) => article.slug === entry.slug)
  })

  console.log('Uploading to Polar')
  await Promise.all(
    articlesToUpdate.map(async (entry) => {
      console.log('Updating article', entry.slug)
      const article = articles.find((article) => article.slug === entry.slug)!
      return await client.articles.update({
        id: article.id,
        articleUpdate: {
          title: entry.data.title,
          body: processBody(entry),
          published_at: entry.data.date.toISOString(),
          set_published_at: true,
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
          body: processBody(entry),
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
