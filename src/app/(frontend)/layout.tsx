import type { Metadata } from 'next'
import { Inter, Source_Serif_4 } from 'next/font/google'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { getNavigation } from '@/lib/data'
import './globals.css'

// Self-hosted by next/font, so there is no third-party request and no font swap
// shifting the layout — both of which count against the Core Web Vitals targets.
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-source-serif',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Midwest Euchre Company — Everything Euchre. All in One Place.',
    template: '%s · Midwest Euchre Company',
  },
  description:
    'Learn the game, sharpen your strategy, and join the next generation of euchre. Weekly hand challenges, rules and strategy from the Midwest Euchre Company.',
  icons: { icon: '/icon.png', apple: '/apple-touch-icon.png' },
  openGraph: { type: 'website', siteName: 'Midwest Euchre Company', url: siteUrl },
}

export default async function FrontendLayout({ children }: { children: React.ReactNode }) {
  const nav = await getNavigation()

  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-navy focus:px-4 focus:py-3 focus:text-white"
        >
          Skip to content
        </a>
        {/* Organization schema, site-wide */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Midwest Euchre Company',
              url: siteUrl,
              logo: `${siteUrl}/logo.png`,
              foundingDate: '2026',
              description:
                'Euchre rules, strategy and a weekly hand challenge from the Midwest Euchre Company.',
            }),
          }}
        />
        <SiteHeader nav={nav} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter nav={nav} />
      </body>
    </html>
  )
}
