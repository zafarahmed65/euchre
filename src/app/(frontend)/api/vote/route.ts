import { NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { payloadClient, getTallies } from '@/lib/data'
import {
  VOTER_COOKIE,
  VOTER_COOKIE_MAX_AGE,
  newVoterId,
  rateLimit,
  toPercentages,
  voterHash,
} from '@/lib/voting'
import type { Hand } from '@/payload-types'

/**
 * Vote counts must never be cached — the hand page itself is static for a fast LCP,
 * and this endpoint is the one dynamic hole in it. Getting this wrong is exactly how
 * a cached CMS ends up serving yesterday's percentages.
 */
export const dynamic = 'force-dynamic'

const clientIp = async (): Promise<string> => {
  const h = await headers()
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || 'unknown'
}

const loadHand = async (handId: string | number): Promise<Hand | null> => {
  const payload = await payloadClient()
  try {
    return (await payload.findByID({ collection: 'hands', id: handId, depth: 0 })) as Hand
  } catch {
    return null
  }
}

const resultsPayload = (hand: Hand, counts: number[], total: number, hasVoted: boolean, votedFor: number | null) => ({
  counts,
  percentages: toPercentages(counts),
  total,
  hasVoted,
  votedFor,
  votingOpen: hand.votingOpen !== false,
  showResults: hand.showResults !== false,
})

// ── GET: current tallies + whether this browser already voted ──────────────────
export async function GET(request: Request) {
  const handId = new URL(request.url).searchParams.get('handId')
  if (!handId) return NextResponse.json({ error: 'handId is required' }, { status: 400 })

  const hand = await loadHand(handId)
  if (!hand) return NextResponse.json({ error: 'Hand not found' }, { status: 404 })

  const { counts, total } = await getTallies(hand.id, hand.choices.length)

  const existingId = (await cookies()).get(VOTER_COOKIE)?.value
  let votedFor: number | null = null

  if (existingId) {
    const payload = await payloadClient()
    const { docs } = await payload.find({
      collection: 'votes',
      where: { voterHash: { equals: voterHash(existingId, hand.id) } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (docs[0]) votedFor = (docs[0] as { choiceIndex: number }).choiceIndex
  }

  const response = NextResponse.json(
    resultsPayload(hand, counts, total, votedFor !== null, votedFor),
  )

  // Establish the voter id here, on the read the panel makes when it mounts,
  // rather than waiting for the vote itself. Minting it at POST time means two
  // rapid first clicks arrive with no cookie, each mint their own id, and both
  // count — this closes that race before the reader can reach the button.
  if (!existingId) {
    response.cookies.set(VOTER_COOKIE, newVoterId(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: VOTER_COOKIE_MAX_AGE,
      path: '/',
    })
  }

  return response
}

// ── POST: cast a vote ──────────────────────────────────────────────────────────
export async function POST(request: Request) {
  if (!rateLimit(await clientIp())) {
    return NextResponse.json({ error: 'Too many requests. Try again shortly.' }, { status: 429 })
  }

  const body = (await request.json().catch(() => null)) as
    | { handId?: string | number; choiceIndex?: number }
    | null

  if (!body?.handId || typeof body.choiceIndex !== 'number') {
    return NextResponse.json({ error: 'handId and choiceIndex are required' }, { status: 400 })
  }

  const hand = await loadHand(body.handId)
  if (!hand) return NextResponse.json({ error: 'Hand not found' }, { status: 404 })

  if (hand.votingOpen === false) {
    const { counts, total } = await getTallies(hand.id, hand.choices.length)
    return NextResponse.json(
      { ...resultsPayload(hand, counts, total, false, null), error: 'Voting is closed on this hand.' },
      { status: 409 },
    )
  }

  if (body.choiceIndex < 0 || body.choiceIndex >= hand.choices.length) {
    return NextResponse.json({ error: 'That choice does not exist.' }, { status: 400 })
  }

  // A vote must carry an established voter id. If it does not, issue one and ask
  // the caller to retry rather than counting the vote: two cookieless requests
  // racing each other would otherwise mint two ids and both be counted. After the
  // retry they share one cookie, so the second is recognised as a duplicate.
  const cookieStore = await cookies()
  const existingId = cookieStore.get(VOTER_COOKIE)?.value

  if (!existingId) {
    const retry = NextResponse.json(
      { retry: true, error: 'Establishing your session — retrying.' },
      { status: 428 },
    )
    retry.cookies.set(VOTER_COOKIE, newVoterId(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: VOTER_COOKIE_MAX_AGE,
      path: '/',
    })
    return retry
  }

  const voterId = existingId
  const hash = voterHash(voterId, hand.id)

  const payload = await payloadClient()
  const { docs: priorVotes } = await payload.find({
    collection: 'votes',
    where: { voterHash: { equals: hash } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const alreadyVoted = priorVotes.length > 0
  if (!alreadyVoted) {
    await payload.create({
      collection: 'votes',
      data: { hand: hand.id, choiceIndex: body.choiceIndex, voterHash: hash },
      overrideAccess: true,
    })
  }

  const votedFor = alreadyVoted
    ? (priorVotes[0] as { choiceIndex: number }).choiceIndex
    : body.choiceIndex

  const { counts, total } = await getTallies(hand.id, hand.choices.length)
  return NextResponse.json(
    {
      ...resultsPayload(hand, counts, total, true, votedFor),
      ...(alreadyVoted ? { notice: 'You have already voted on this hand.' } : {}),
    },
    { status: alreadyVoted ? 409 : 200 },
  )
}
