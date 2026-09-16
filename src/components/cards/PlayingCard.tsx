import type { Rank, Suit } from '@/lib/cards'
import { SUIT_GLYPH, cardLabel, isRedSuit } from '@/lib/cards'

export type CardSize = 'sm' | 'md' | 'lg'

/**
 * Fluid widths, not fixed pixels — five cards plus an upcard have to fit a 390px
 * phone without wrapping, and still look generous on a 1440px desktop.
 */
const WIDTH: Record<CardSize, string> = {
  sm: 'clamp(30px, 8vw, 44px)',
  md: 'clamp(44px, 12.5vw, 68px)',
  lg: 'clamp(58px, 16vw, 92px)',
}

type Props = {
  rank: Rank
  suit: Suit
  size?: CardSize
  /** Marks the card as trump. Shows a gold frame AND a text badge — never colour alone. */
  trump?: boolean
  className?: string
}

/**
 * Cards are drawn, not photographed.
 *
 * The commissioned Euchre Next artwork does not exist yet, and the brief forbids
 * copying Bicycle or other protected decks. Drawing them here means the demo ships
 * with zero licensing risk, stays crisp at every size, costs no image requests
 * against the 2.5s LCP budget, and — because this is one component — swaps to the
 * real artwork in a single file when it arrives.
 */
export function PlayingCard({ rank, suit, size = 'md', trump = false, className = '' }: Props) {
  const glyph = SUIT_GLYPH[suit]
  const ink = isRedSuit(suit) ? 'var(--color-card-red)' : 'var(--color-ink)'
  const isFace = rank === 'J' || rank === 'Q' || rank === 'K'
  const narrow = rank === '10'

  // One index block, drawn twice: upright at top-left, and rotated 180° about the
  // card's centre so the bottom-right copy mirrors it exactly, as on a real card.
  const index = (
    <>
      <text
        x="10"
        y="31"
        fill={ink}
        fontSize={narrow ? 23 : 27}
        fontWeight="700"
        fontFamily="var(--font-serif)"
        textAnchor="start"
      >
        {rank}
      </text>
      <text x="10" y="49" fill={ink} fontSize="19" textAnchor="start">
        {glyph}
      </text>
    </>
  )

  return (
    <span
      className={`relative inline-block shrink-0 ${className}`}
      style={{ width: WIDTH[size], aspectRatio: '100 / 140' }}
    >
      <svg
        viewBox="0 0 100 140"
        width="100%"
        height="100%"
        role="img"
        aria-label={cardLabel(rank, suit) + (trump ? ' — trump' : '')}
        className="block drop-shadow-sm"
      >
        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="137"
          rx="8"
          fill="#ffffff"
          stroke={trump ? 'var(--color-gold-deep)' : 'var(--color-rule)'}
          strokeWidth={trump ? 3 : 1.5}
        />

        {index}

        {/* Centre: a large pip, or the rank letter for a face card */}
        {isFace ? (
          <>
            <text
              x="50"
              y="84"
              fill={ink}
              fontSize="42"
              fontWeight="700"
              fontFamily="var(--font-serif)"
              textAnchor="middle"
            >
              {rank}
            </text>
            <text x="50" y="107" fill={ink} fontSize="18" textAnchor="middle">
              {glyph}
            </text>
          </>
        ) : (
          <text x="50" y="96" fill={ink} fontSize="42" textAnchor="middle">
            {glyph}
          </text>
        )}

        <g transform="rotate(180 50 70)">{index}</g>
      </svg>

      {trump && (
        <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-gold-deep px-1.5 py-px text-[8px] leading-tight font-bold tracking-wide text-white uppercase sm:text-[9px]">
          Trump
        </span>
      )}
    </span>
  )
}
