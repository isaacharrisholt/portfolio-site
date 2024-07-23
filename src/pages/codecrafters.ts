import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async () => {
  // Redirect to codecrafters.io
  return new Response(null, {
    status: 301,
    headers: {
      Location: 'https://app.codecrafters.io/join?via=isaacharrisholt',
    },
  })
}
