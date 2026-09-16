import type { Rank, Suit } from '@/lib/cards'
import { PlayingCard, type CardSize } from './PlayingCard'
import { isTrump } from '@/lib/cards'

type CardData = { rank: Rank; suit: Suit }

type Props = {
  cards: CardData[]
  size?: CardSize
  /** When set, cards belonging to trump get a gold frame and a "Trump" badge. */
  trumpSuit?: Suit
  label?: string
  className?: string
}

export function CardRow({ cards, size = 'md', trumpSuit, label, className = '' }: Props) {
  return (
    <div className={className}>
      {label && (
        <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-gold uppercase">
          {label}
        </p>
      )}
      <ul className="flex list-none flex-wrap gap-1.5 p-0 sm:gap-2">
        {cards.map((card, i) => (
          <li key={`${card.rank}-${card.suit}-${i}`} className="leading-none">
            <PlayingCard
              rank={card.rank}
              suit={card.suit}
              size={size}
              trump={trumpSuit ? isTrump(card, trumpSuit) : false}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
