import { createHash, randomUUID } from 'crypto'

export const VOTER_COOKIE = 'mec_voter'
export const VOTER_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // one year

/**
 * A vote is tied to a one-way hash of (anonymous cookie id + hand + server salt).
 *
 * Nothing reversible and nothing personal is stored, which is what the brief means
 * by "results must never expose personal information". Salting per-hand also means
 * two hands cannot be correlated to the same reader.
 */
export const voterHash = (voterId: string, handId: number | string): string =>
  createHash('sha256')
    .update(`${voterId}:${handId}:${process.env.VOTE_SALT || 'dev-salt'}`)
    .digest('hex')

export const newVoterId = (): string => randomUUID()

/**
 * Deliberately modest abuse control.
 *
 * The brief asks only that casual duplicate voting be prevented with "a reasonable
 * cookie/session approach" — this is not ballot-grade integrity and should not be
 * described to the client as such. In production this map moves to Redis so it
 * survives more than one serverless instance.
 */
const hits = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 10

export function rateLimit(key: string): boolean {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_PER_WINDOW) return false

  entry.count += 1
  return true
}

/** Percentages that always add up to 100 — largest-remainder, so nothing reads 99%. */
export function toPercentages(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0)
  if (total === 0) return counts.map(() => 0)

  const exact = counts.map((c) => (c / total) * 100)
  const floors = exact.map(Math.floor)
  let remainder = 100 - floors.reduce((a, b) => a + b, 0)

  const order = exact
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac)

  const result = [...floors]
  for (const { index } of order) {
    if (remainder <= 0) break
    result[index] += 1
    remainder -= 1
  }
  return result
}
