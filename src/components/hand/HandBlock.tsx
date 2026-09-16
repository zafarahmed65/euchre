import Link from 'next/link'
import type { Hand } from '@/payload-types'
import { CardRow } from '@/components/cards/CardRow'
import { PlayingCard } from '@/components/cards/PlayingCard'
import { VotePanel } from './VotePanel'
import { POSITION_LABEL, SEAT_LABEL, formatDate } from '@/lib/format'
import type { Rank, Suit } from '@/lib/cards'

type Props = {
  hand: Hand
  /**
   * 'home' shows the summary and links through to the permanent page;
   * 'page' is the full scenario on the hand's own URL.
   */
  variant?: 'home' | 'page'
}

export function HandBlock({ hand, variant = 'home' }: Props) {
  const cards = (hand.hand ?? []).map((c) => ({ rank: c.rank as Rank, suit: c.suit as Suit }))
  const upcard = { rank: hand.upcard.rank as Rank, suit: hand.upcard.suit as Suit }
  // In the first round the upcard is the proposed trump, so bowers highlight against it.
  const trumpSuit = hand.biddingRound === 'first' ? upcard.suit : undefined

  const meta = [
    `Us ${hand.scoreUs} • Them ${hand.scoreThem}`,
    SEAT_LABEL[hand.seat],
    `Dealer: ${POSITION_LABEL[hand.dealer]}`,
    hand.biddingRound === 'second' ? 'Second round' : null,
  ].filter(Boolean) as string[]

  return (
    <section
      aria-labelledby={`hand-${hand.id}-heading`}
      className="relative rounded-lg bg-navy px-4 pt-8 pb-6 text-cream md:px-8 md:pt-9 md:pb-8"
    >
      {/* Gold inset frame, as drawn in the mockup */}
      <div
        className="pointer-events-none absolute inset-2 rounded-md border border-gold/45 md:inset-3"
        aria-hidden="true"
      />

      {hand.label && (
        <p className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gold px-4 py-1 text-[11px] font-bold tracking-[0.16em] whitespace-nowrap text-navy uppercase">
          {hand.label}
        </p>
      )}

      <div className="relative grid gap-6 md:grid-cols-[1.15fr_auto_0.9fr] md:items-start md:gap-8">
        {/* ── Scenario ──────────────────────────────────────────────── */}
        <div>
          <h2
            id={`hand-${hand.id}-heading`}
            className="font-serif text-3xl leading-none font-bold text-cream md:text-4xl"
          >
            {variant === 'home' ? 'Today\u2019s Hand' : hand.title}
          </h2>
          <p className="mt-1.5 text-[15px] text-cream/75">{formatDate(hand.publishDate)}</p>

          {/* Chips on small screens, pipe-separated on wide ones — a wrapped row
              would otherwise start a line with a dangling separator. */}
          <ul className="mt-4 flex list-none flex-wrap items-center gap-x-2 gap-y-2 border-t border-gold/30 p-0 pt-4 text-[13px] font-semibold text-cream/90 md:gap-x-3">
            {meta.map((item, i) => (
              <li key={item} className="flex items-center gap-2 md:gap-3">
                {i > 0 && (
                  <span aria-hidden="true" className="hidden text-gold/50 md:inline">
                    |
                  </span>
                )}
                <span className="rounded bg-white/10 px-2 py-0.5 md:bg-transparent md:px-0 md:py-0">
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <CardRow cards={cards} size="md" trumpSuit={trumpSuit} className="mt-5" label="Your hand" />
        </div>

        {/* ── Upcard ───────────────────────────────────────────────── */}
        <div className="flex items-start gap-5 md:h-full md:border-x md:border-gold/30 md:px-7">
          <div className="text-center">
            <p className="mb-2 text-[11px] leading-tight font-bold tracking-[0.12em] text-gold uppercase">
              Dealer
              <br className="hidden md:block" /> upcard
            </p>
            <PlayingCard rank={upcard.rank} suit={upcard.suit} size="lg" />
          </div>
        </div>

        {/* ── Question + vote ──────────────────────────────────────── */}
        <div>
          <h3 className="font-serif text-xl leading-tight font-bold text-cream md:text-2xl">
            {hand.question}
          </h3>
          <div className="mt-4">
            <VotePanel
              handId={hand.id}
              choices={hand.choices}
              votingOpen={hand.votingOpen !== false}
              showResults={hand.showResults !== false}
              revealCorrect={variant === 'page'}
            />
          </div>

          {variant === 'home' && (
            <Link
              href={`/hand/${hand.slug}`}
              className="tap-target -mx-1 inline-flex items-center gap-1.5 px-1 text-[15px] font-bold text-gold underline underline-offset-4 hover:text-gold-deep"
            >
              Read the full analysis
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
