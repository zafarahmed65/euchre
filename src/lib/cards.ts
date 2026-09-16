/**
 * Euchre uses a 24-card deck: 9, 10, J, Q, K, A in each suit.
 * These constants drive three things at once — the Payload admin dropdowns,
 * the SVG card components, and the seed data — so a card can never be
 * described one way in the CMS and drawn another way on the page.
 */

export const RANKS = ['9', '10', 'J', 'Q', 'K', 'A'] as const
export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const

export type Rank = (typeof RANKS)[number]
export type Suit = (typeof SUITS)[number]

export type Card = { rank: Rank; suit: Suit }

export const SUIT_GLYPH: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
}

export const SUIT_LABEL: Record<Suit, string> = {
  spades: 'Spades',
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
}

export const RANK_LABEL: Record<Rank, string> = {
  '9': 'Nine',
  '10': 'Ten',
  J: 'Jack',
  Q: 'Queen',
  K: 'King',
  A: 'Ace',
}

/** Hearts and diamonds print red. Never the only signal — shape carries it too. */
export const isRedSuit = (suit: Suit): boolean => suit === 'hearts' || suit === 'diamonds'

/** "Ace of Spades" — used for aria-label and visually-hidden text on every card. */
export const cardLabel = (rank: Rank, suit: Suit): string =>
  `${RANK_LABEL[rank]} of ${SUIT_LABEL[suit]}`

/** The suit of the same colour — the left bower's home suit when trump is named. */
export const sameColourSuit = (suit: Suit): Suit => {
  const pairs: Record<Suit, Suit> = {
    spades: 'clubs',
    clubs: 'spades',
    hearts: 'diamonds',
    diamonds: 'hearts',
  }
  return pairs[suit]
}

/** Right bower = jack of trump. Left bower = jack of the same-colour suit. */
export const isRightBower = (card: Card, trump: Suit): boolean =>
  card.rank === 'J' && card.suit === trump

export const isLeftBower = (card: Card, trump: Suit): boolean =>
  card.rank === 'J' && card.suit === sameColourSuit(trump)

export const isTrump = (card: Card, trump: Suit): boolean =>
  card.suit === trump || isLeftBower(card, trump)

/** Payload `select` options, generated from the same source of truth. */
export const rankOptions = RANKS.map((rank) => ({
  label: `${rank}  —  ${RANK_LABEL[rank]}`,
  value: rank,
}))

export const suitOptions = SUITS.map((suit) => ({
  label: `${SUIT_GLYPH[suit]}  ${SUIT_LABEL[suit]}`,
  value: suit,
}))
