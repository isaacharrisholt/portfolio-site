---
title: 'Integrating an Astro blog with Polar.sh'
subtitle: 'A seamless writing experience for open-source developers'
date: 2024-03-06
image: '../../../public/images/astro-polar/astronaut-toys.jpg'
tags:
  - web
polar:
  include_subtitle: true
  include_image: true
---

Polar is on a mission to fix open source funding. Their platform and tools empower software engineers to more easily generate a meaningful income from the work that they do. It's a great project that I've started supporting with content and contributions in my free time! It's a content platform aimed at devs. What more could I want?

Since chatting with the founder [Birk](https://twitter.com/birk) for the first time, I wanted to start writing on Polar. The only problem: I also have to write for [my own personal blog](https://ihh.dev/blog). While the two both use markdown as the basis for their posts, copy and pasting is _so_ 2023. Like a good engineer, I decided to spend hours automating something that would probably cost me about 30 minutes a year.

As a dev-first platform, the legends at Polar keep [their API](https://docs.polar.sh/api/) open and powerful - it's actually the same API they use to build [polar.sh](https://polar.sh). It formed the basis for what we're talking about today: how I integrated Polar with the framework I use to build by own site - Astro.

[Astro](https://astro.build) is a static-first web framework loved by devs and content creators alike for it's easy-to-use APIs and content-driven philosophy. I love how accessible it makes the internet, shipping zero client-side JavaScript by default, but allowing sprinkles of interactivity through its innovative 'Islands' architecture.

So, what does the integration do?

The first iteration of the integration is predominantly focused on pushing your existing and future Astro content to your profile on Polar. As such, it provides a neat wrapper around the Polar SDK for Astro's [Content Collections](https://docs.astro.build/en/guides/content-collections/), along with some extra tools to help you keep your frontmatter type safe.

## Getting started

Install `@polar-sh/astro` with your favourite package manager:

```bash
pnpm add @polar-sh/sdk
```

Then, get started by creating a Polar client with your access token:

```typescript
import { Polar } from '@polar-sh/astro'

const polar = new Polar({ accessToken })
```

Access tokens can be generated on your Polar [Settings page](https://polar.sh/settings).

## Uploading posts

You can start uploading your Astro posts using the Polar upload builder with your Astro collection entries:

```typescript
import { getCollection } from 'astro:content'
import { Polar } from '@polar-sh/astro'

const posts = await getCollection('blog')

const polar = new Polar({ accessToken })

const { data, error } = await polar.upload(posts, {
  organizationName,
})
```

Your organization name can be found using the [`organizations` endpoints](https://api.polar.sh/redoc#tag/organizations) available on the Polar API, but it's typically just your GitHub username or your organization's GitHub name.

The above code will upload all your posts to Polar, and will update any existing posts that share a `slug` between Astro and Polar. The default parameters are as follows:

```typescript
{
  title: entry.id,
  slug: entry.slug,
  body: entry.body,
}
```

Where `entry` is an Astro collection entry object. `entry.id` usually corresponds to the filename.

However, you might not actually want to upload _all_ your posts to Polar. Some might be exclusive to readers on your own site, or you might want to add or change some of the metadata that gets uploaded by default - like the title!

## Filtering uploaded posts

The upload functionality uses the builder pattern, making it super simple to configure and shape your upload pipeline as you like. The first way to do that is via the `filter` method on the `PolarUploadBuilder` class. For example, you can filter out any posts that have already been uploaded using the following:

```typescript
const { data, error } = await polar
  .upload(posts, {
    organizationName,
  })
  .filter(({ exists }) => !exists)
```

The `exists` property of the function parameter is a `boolean` indicating whether the post has been uploaded to Polar previously.

Other available parameters, as of the initial version of the SDK, include:

| Parameter  | Type                                  | Description                                                                     |
| ---------- | ------------------------------------- | ------------------------------------------------------------------------------- |
| `entry`    | `CollectionEntry<CollectionEntryKey>` | The Astro collection entry                                                      |
| `article`  | `PolarArticle`                        | The object to be uploaded to the Polar API                                      |
| `existing` | `Article`                             | The article that was previously uploaded to Polar using this slug, if it exists |

## Transforming posts

The `transform` method allows you to change the data that'll be used in the API request to Polar. It takes the same inputs as the `filter` method, and returns a `PolarArticle`. You can chain `transform` functions together, and the article type will be passed through the chain.

For example, this code would add a constant to any article that has not previously been uploaded, and then add a hero image to the post if it exists.

```typescript
const { data, error } = await polar
  .upload(posts, {
    organizationName,
  })
  .filter(({ exists }) => !exists)
  .transform(({ article }) => {
    article.title = 'TODO' as const
    return article
  })
  .transform(({ entry, article }) => {
    if (entry.data.image) {
      // Add the image as a markdown image at the start of the article
      article.body = `![](${Astro.url.host}${entry.data.image.src})\n\n${article.body}`
    }
    return article
    //     ^? { title: 'TODO', ... }
  })
```

## Accessing other Polar API functions

I didn't want to have to recreate the entire Polar API in the Astro integration, but I also didn't want to force people to use both the Astro SDK and the regular Polar SDK. As such, you can access the `Polar` class' underlying API client via the `client` property:

```typescript
pledge = await polar.client.pledges.get({ id: 'pledge-id' })
```

## Type safe frontmatter

Astro allows you to add [YAML frontmatter](https://docs.astro.build/en/guides/markdown-content/#markdown-features) to your markdown and MDX posts to add custom metadata. Astro Content Collections take that a step further and provide frontmatter type safety via a [Zod](https://zod.dev) schema you can specify in your `config.ts` file.

The Polar Astro SDK ships with a custom Zod schema for common properties you might like to include in your frontmatter. All properties are optional, but they match the API parameter names exactly, allowing you to spread them into your uploaded articles.

To set this up, include the `polarArticleSchema` in your collection config:

```typescript
import { z, defineCollection } from 'astro:content'
import { polarArticleSchema } from '@polar-sh/astro'

defineCollection({
  schema: z.object({
    // Your custom frontmatter properties here...
    // ...
    polar: polarArticleSchema.optional(),
  }),
})
```

Then you can access these properties in your `filter` and `transform` functions:

```typescript
const { data, error } = await polar
  .upload(posts, {
    organizationName,
  })
  .transform(({ entry, article }) => {
    article = {
      ...article,
      ...entry.data.polar,
      // `published_at` is a date and needs to be a string
      published_at: entry.data.polar?.published_at?.toISOString(),
    }
    return article
  })
```

## So how does it all work?

You might have noticed that there's no `execute` or `run` method at the end of the chained functions in the examples above. So how does the SDK work?

Well, step by step:

1. The user creates an instance of the `Polar` class with their access token.
2. Calling `.upload()` creates an instance of the `PolarUploadBuilder` class.
   - The `PolarUploadBuilder` class internally maintains a pipeline of `UploadBuilderFunctionDefinition`s, which contain the user's `transform` and `filter` functions and the operation (i.e. `transform`) the function pertains to.
3. Using the `transform` or `filter` function returns a new `PolarUploadBuilder` instance with the new function added to the pipeline.
4. Calling the `.then()` method on the upload builder (typically via `await`) triggers the upload to Polar, which runs through the pipeline and uploads what comes out the other end.
   - The `PolarUploadBuilder` implements the `PromiseLike` interface.

Passing the types through the `transform` functions is achieved by making the `PolarUploadBuilder` a generic class with two type parameters: the type of the user's Astro collection entries, and the return type of the latest `transform` function in the chain.

All the code is available on the [Polar GitHub](https://github.com/polarsource/polar/tree/main/clients/packages/astro) for your perusal, if you're interested. I had a great deal of fun putting it all together, and I hope it comes in handy for others, too!

If you'd like to see a production example, you can check out [my portfolio site](https://ihh.dev) for some inspiration.

---

I'd also like to thank the Polar team for being so supportive of my little contribution, and Birk for introducing me to Polar in the first place! It's one of my favourite open source projects, and I think they're moving in the right direction.

I'm excited to see where they take the project, and I encourage all of you to sign up!

Oh, and if you're reading this on Polar, I actually uploaded it to https://ihh.dev first... sorry! 😉

Happy coding,

Isaac
