'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Navigation } from '@/payload-types'

export function SiteHeader({ nav }: { nav: Navigation }) {
  const [open, setOpen] = useState(false)
  const links = nav?.headerLinks ?? []
  const cta = nav?.headerCta

  return (
    <header className="border-b border-rule bg-cream">
      <div className="wrap flex items-center justify-between gap-4 py-3 md:py-4">
        {/* The brief is specific: the circular logo alone, no wordmark beside it. */}
        <Link href="/" className="flex items-center" aria-label="Midwest Euchre Company — home">
          <Image
            src="/logo.png"
            alt="Midwest Euchre Company"
            width={72}
            height={72}
            priority
            className="h-14 w-14 md:h-[72px] md:w-[72px]"
          />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.id ?? link.href}
              href={link.href}
              className="tap-target flex items-center text-[15px] font-semibold text-navy hover:text-gold-deep"
            >
              {link.label}
            </Link>
          ))}
          {cta?.label && (
            <Link
              href={cta.href || '#'}
              className="tap-target flex items-center rounded-full border-2 border-gold px-5 text-[15px] font-bold text-navy hover:bg-gold/15"
            >
              {cta.label}
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          className="tap-target -mr-2 flex items-center justify-center md:hidden"
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <svg width="30" height="22" viewBox="0 0 30 22" aria-hidden="true" fill="none">
            {open ? (
              <>
                <path d="M4 3l22 16M26 3L4 19" stroke="#0E2A47" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M2 2h26M2 11h26M2 20h26" stroke="#0E2A47" strokeWidth="3" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-rule bg-cream md:hidden">
          <ul className="wrap list-none py-2">
            {[...links, ...(cta?.label ? [{ id: 'cta', label: cta.label, href: cta.href || '#' }] : [])].map(
              (link) => (
                <li key={link.id ?? link.href} className="border-b border-rule/60 last:border-0">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="tap-target flex items-center text-base font-semibold text-navy"
                  >
                    {link.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </header>
  )
}
