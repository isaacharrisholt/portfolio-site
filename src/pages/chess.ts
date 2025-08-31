import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async () => {
  // Redirect to RR
  return new Response(null, {
    status: 301,
    headers: {
      Location:
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1&pp=ygUXbmV2ZXIgZ29ubmEgZ2l2ZSB5b3UgdXCgBwE%3D',
    },
  })
}
