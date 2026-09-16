import Image from 'next/image'
import Link from 'next/link'
import type { Navigation } from '@/payload-types'

const SOCIAL_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  youtube: 'YouTube',
  instagram: 'Instagram',
  x: 'X',
}

export function SiteFooter({ nav }: { nav: Navigation }) {
  const links = nav?.footerLinks ?? []
  const social = nav?.socialLinks ?? []

  return (
    <footer className="mt-16 border-t-4 border-gold bg-navy text-cream/85">
      <div className="wrap grid gap-8 py-10 md:grid-cols-[auto_1fr_auto] md:items-start md:gap-12">
        <div className="flex items-center gap-4">
          <Image src="/logo.png" alt="" width={64} height={64} className="h-16 w-16" />
          <p className="font-serif text-lg leading-tight font-bold text-cream">
            Midwest Euchre
            <br />
            Company
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex list-none flex-wrap gap-x-6 gap-y-1 p-0">
            {links.map((link) => (
              <li key={link.id ?? link.href}>
                <Link
                  href={link.href}
                  className="tap-target flex items-center text-[15px] font-semibold text-cream/85 hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {social.length > 0 && (
          <ul className="flex list-none gap-4 p-0">
            {social.map((item) => (
              <li key={item.id ?? item.href}>
                <a
                  href={item.href}
                  className="tap-target flex items-center text-[15px] font-semibold text-cream/85 hover:text-gold"
                >
                  {SOCIAL_LABEL[item.platform] ?? item.platform}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-cream/15">
        <div className="wrap py-5 text-sm text-cream/60">
          © {new Date().getFullYear()} Midwest Euchre Company. Established 2026.
        </div>
      </div>
    </footer>
  )
}
