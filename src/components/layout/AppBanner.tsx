import Link from 'next/link'
import { PlayingCard } from '@/components/cards/PlayingCard'

type Props = {
  heading?: string | null
  subheading?: string | null
  ctaLabel?: string | null
  ctaHref?: string | null
}

/**
 * Restrained by design. The brief is explicit that the site must introduce the app
 * "without making the site feel like an advertisement" — so this is one calm band
 * near the bottom of the page, never a popup or an interstitial.
 */
export function AppBanner({ heading, subheading, ctaLabel, ctaHref }: Props) {
  return (
    <aside
      id="euchre-next"
      className="flex flex-col items-start gap-4 rounded-lg bg-sky px-5 py-6 sm:flex-row sm:items-center sm:gap-6 sm:px-8"
    >
      <div
        className="flex shrink-0 items-center rounded-lg bg-navy p-3"
        aria-hidden="true"
      >
        <span className="rotate-[-6deg]">
          <PlayingCard rank="A" suit="hearts" size="sm" />
        </span>
        <span className="-ml-3 rotate-[6deg]">
          <PlayingCard rank="K" suit="spades" size="sm" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="font-serif text-2xl leading-tight font-bold text-navy md:text-3xl">{heading}</h2>
        <p className="mt-1 text-[17px] text-navy/80">{subheading}</p>
      </div>

      {ctaLabel && (
        <Link
          href={ctaHref || '#'}
          className="tap-target inline-flex shrink-0 items-center rounded-full bg-navy px-6 font-bold text-cream hover:bg-navy-deep"
        >
          {ctaLabel}
        </Link>
      )}
    </aside>
  )
}
