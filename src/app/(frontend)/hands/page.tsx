import type { Metadata } from 'next'
import Link from 'next/link'
import { CardRow } from '@/components/cards/CardRow'
import { PlayingCard } from '@/components/cards/PlayingCard'
import { getHands } from '@/lib/data'
import { DECISION_LABEL, DIFFICULTY_LABEL, formatDate } from '@/lib/format'
import { DECISION_TYPES } from '@/collections/Hands'
import type { Rank, Suit } from '@/lib/cards'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Past Hands & Decisions',
  description:
    'Every weekly euchre scenario, filterable by decision type — ordering, second round, going alone, opening lead, defense and discard.',
  alternates: { canonical: '/hands' },
}

type Props = { searchParams: Promise<{ decision?: string }> }

export default async function HandsArchivePage({ searchParams }: Props) {
  const { decision } = await searchParams
  const active = DECISION_TYPES.some((d) => d.value === decision) ? decision : undefined
  const hands = await getHands({ decision: active })

  return (
    <div className="wrap py-8 md:py-12">
      <h1 className="text-4xl md:text-5xl">Past Hands &amp; Decisions</h1>
      <p className="mt-3 max-w-[60ch] text-lg text-ink-muted">
        Every weekly scenario, kept here so you can work through the decisions that come up most
        often at the table.
      </p>

      {/* Filters are plain links, so they work without JavaScript and each one is
          a shareable, indexable URL. */}
      <nav aria-label="Filter by decision type" className="mt-7">
        <ul className="flex list-none flex-wrap gap-2 p-0">
          <li>
            <Link
              href="/hands"
              aria-current={!active ? 'true' : undefined}
              className={`tap-target inline-flex items-center rounded-full border-2 px-4 text-[15px] font-semibold ${
                !active
                  ? 'border-navy bg-navy text-cream'
                  : 'border-rule text-navy hover:border-gold'
              }`}
            >
              All hands
            </Link>
          </li>
          {DECISION_TYPES.map((type) => {
            const isActive = active === type.value
            return (
              <li key={type.value}>
                <Link
                  href={`/hands?decision=${type.value}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`tap-target inline-flex items-center rounded-full border-2 px-4 text-[15px] font-semibold ${
                    isActive
                      ? 'border-navy bg-navy text-cream'
                      : 'border-rule text-navy hover:border-gold'
                  }`}
                >
                  {type.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <p className="mt-6 text-sm text-ink-muted" role="status">
        {hands.length} {hands.length === 1 ? 'hand' : 'hands'}
        {active ? ` in ${DECISION_LABEL[active].toLowerCase()}` : ''}
      </p>

      {hands.length === 0 ? (
        <p className="mt-8 rounded-md border border-rule bg-cream-deep/50 p-8 text-center text-ink-muted">
          No hands in this category yet. <Link href="/hands" className="underline">See all hands</Link>.
        </p>
      ) : (
        <ul className="mt-5 grid list-none gap-5 p-0 md:grid-cols-2">
          {hands.map((hand) => {
            const cards = (hand.hand ?? []).map((c) => ({
              rank: c.rank as Rank,
              suit: c.suit as Suit,
            }))
            return (
              <li key={hand.id}>
                <Link
                  href={`/hand/${hand.slug}`}
                  className="group flex h-full flex-col rounded-lg border border-rule bg-white/60 p-5 hover:border-gold"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[11px] font-bold tracking-[0.1em] text-gold-deep uppercase">
                      {DECISION_LABEL[hand.decisionType]}
                      {hand.difficulty ? ` · ${DIFFICULTY_LABEL[hand.difficulty]}` : ''}
                    </p>
                    <p className="shrink-0 text-[13px] text-ink-muted">
                      {formatDate(hand.publishDate)}
                    </p>
                  </div>

                  <h2 className="mt-2 font-serif text-xl leading-snug group-hover:text-gold-deep">
                    {hand.title}
                  </h2>

                  <p className="mt-1 text-[15px] text-ink-muted">
                    Us {hand.scoreUs} • Them {hand.scoreThem}
                  </p>

                  <div className="mt-4 flex items-end gap-4">
                    <CardRow cards={cards} size="sm" />
                    <div className="ml-auto text-center">
                      <p className="mb-1 text-[9px] font-bold tracking-wider text-ink-muted uppercase">
                        Upcard
                      </p>
                      <PlayingCard
                        rank={hand.upcard.rank as Rank}
                        suit={hand.upcard.suit as Suit}
                        size="sm"
                      />
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
