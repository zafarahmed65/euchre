/**
 * Served as a route handler rather than Next's `robots.ts` metadata convention,
 * which this App Router + Payload setup does not register.
 */
export const dynamic = 'force-static'

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    // The CMS and its API are not search-engine surface area.
    'Disallow: /admin',
    'Disallow: /api/',
    '',
    `Sitemap: ${base}/sitemap.xml`,
    '',
  ].join('\n')

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
