'use client'

import { useRowLabel } from '@payloadcms/ui'
import { RANK_LABEL, SUIT_GLYPH, SUIT_LABEL, isRedSuit } from '@/lib/cards'
import type { Rank, Suit } from '@/lib/cards'

/**
 * Shows the actual card on each collapsed array row — "A♠ Ace of Spades" rather
 * than "Hand 01". The owner can read their whole hand without expanding anything,
 * which is the difference between a form and a puzzle.
 */
export const CardRowLabel = () => {
  const { data, rowNumber } = useRowLabel<{ rank?: Rank; suit?: Suit }>()

  if (!data?.rank || !data?.suit) {
    return <span>Card {String((rowNumber ?? 0) + 1).padStart(2, '0')}</span>
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '0.5rem' }}>
      <strong
        style={{
          fontSize: '1rem',
          color: isRedSuit(data.suit) ? '#d64550' : 'inherit',
        }}
      >
        {data.rank}
        {SUIT_GLYPH[data.suit]}
      </strong>
      <span style={{ opacity: 0.65 }}>
        {RANK_LABEL[data.rank]} of {SUIT_LABEL[data.suit]}
      </span>
    </span>
  )
}
