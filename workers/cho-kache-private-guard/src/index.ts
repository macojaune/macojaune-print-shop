const privatePathPrefix = '/private/cho-kache/'

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (!url.pathname.startsWith(privatePathPrefix)) {
      return fetch(request)
    }

    return new Response('Not found', {
      status: 404,
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Cho-Kache-Private': 'blocked',
        'X-Content-Type-Options': 'nosniff',
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
      },
    })
  },
}
