import type { Rank, Suit } from '@/lib/cards'
import { PlayingCard } from '@/components/cards/PlayingCard'

type CardSpec = { rank: Rank; suit: Suit }

/**
 * A generated thumbnail: a small fan of cards on felt.
 *
 * It means the demo ships without a single stock photo, so "no unlicensed imagery"
 * is true on day one rather than something to fix before launch. The article's real
 * hero image replaces it whenever the owner uploads one.
 */
export function CardArt({
  cards,
  className = '',
  size = 'sm',
}: {
  cards: CardSpec[]
  className?: string
  size?: 'sm' | 'md'
}) {
  const tilt = [-12, -6, 0, 6, 12]

  return (
    <div
      className={`flex items-center justify-center overflow-hidden bg-gradient-to-br from-felt to-felt-deep ${className}`}
      aria-hidden="true"
    >
      <div className="flex items-center">
        {cards.map((card, i) => (
          <span
            key={`${card.rank}-${card.suit}-${i}`}
            className="-ml-4 first:ml-0"
            style={{ transform: `rotate(${tilt[i % tilt.length]}deg)`, zIndex: i }}
          >
            <PlayingCard rank={card.rank} suit={card.suit} size={size} />
          </span>
        ))}
      </div>
    </div>
  )
}

/** Deterministic art per article, so a card never changes between renders. */
export function cardsForSlug(slug: string, count = 3): CardSpec[] {
  const ranks: Rank[] = ['9', '10', 'J', 'Q', 'K', 'A']
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs']

  let seed = 0
  for (let i = 0; i < slug.length; i++) seed = (seed * 31 + slug.charCodeAt(i)) >>> 0

  return Array.from({ length: count }, (_, i) => {
    seed = (seed * 1103515245 + 12345) >>> 0
    return {
      rank: ranks[(seed >>> 8) % ranks.length],
      suit: suits[(seed >>> 16) % suits.length],
    }
  })
}
