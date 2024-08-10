import type { APIRoute } from 'astro'

export const prerender = false

export const GET: APIRoute = async () => {
  // Redirect to codecrafters.io
  return new Response(null, {
    status: 301,
    headers: {
      Location:
        'https://shop.zimaboard.com/products/zimaboard-single-board-server?utm_source=IsaacHarrisHolt&utm_medium=youtube-c&utm_campaign=alice',
    },
  })
}
