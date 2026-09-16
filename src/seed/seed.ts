import { getPayload } from 'payload'
import config from '@payload-config'
import { createHash, randomUUID } from 'crypto'
import { SEED_ARTICLES } from './articles'
import { doc, h, p } from '../lib/richtext'

/**
 * Seed logins. The fallbacks are for a throwaway local database only — any
 * deployed environment sets these, so the credentials in this file never grant
 * access to anything real.
 */
const OWNER = {
  username: process.env.SEED_OWNER_USERNAME || 'owner',
  email: process.env.SEED_OWNER_EMAIL || 'owner@midwesteuchreco.com',
  password: process.env.SEED_OWNER_PASSWORD || 'euchre2026',
  name: 'Site Owner',
}
const EDITOR = {
  username: process.env.SEED_EDITOR_USERNAME || 'editor',
  email: process.env.SEED_EDITOR_EMAIL || 'editor@midwesteuchreco.com',
  password: process.env.SEED_EDITOR_PASSWORD || 'euchre2026',
  name: 'Demo Editor',
}

const daysAgo = (n: number) => {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - n)
  d.setUTCHours(12, 0, 0, 0)
  return d.toISOString()
}

const CATEGORIES = [
  { title: 'Learn', slug: 'learn', description: 'Rules, setup and the basics of play.' },
  { title: 'Strategy', slug: 'strategy', description: 'Bidding, leads and the decisions that win hands.' },
  { title: 'Rules', slug: 'rules', description: 'Scoring, stick the dealer, and how the table agrees.' },
  {
    title: 'History & Community',
    slug: 'history-community',
    description: 'Where euchre came from and where it is still played.',
  },
  { title: 'News & Euchre Next', slug: 'news', description: 'Company news and app updates.' },
]

async function run() {
  const payload = await getPayload({ config })
  payload.logger.info('Seeding Midwest Euchre Company…')

  // ── Users ──────────────────────────────────────────────────────────────
  const { totalDocs: userCount } = await payload.count({ collection: 'users' })
  if (userCount === 0) {
    await payload.create({ collection: 'users', data: { ...OWNER, role: 'admin' } })
    await payload.create({ collection: 'users', data: { ...EDITOR, role: 'editor' } })
    payload.logger.info(`  users: ${OWNER.username} (owner) + ${EDITOR.username} (editor)`)
  } else {
    // Accounts created before username login existed have no username, which
    // would leave them unable to sign in at all. Match them on the email they
    // were seeded with and fill it in.
    let backfilled = 0
    for (const account of [OWNER, EDITOR]) {
      const { docs } = await payload.find({
        collection: 'users',
        where: { email: { equals: account.email } },
        limit: 1,
        overrideAccess: true,
      })
      const existing = docs[0] as { id: number | string; username?: string | null } | undefined
      if (existing && !existing.username) {
        await payload.update({
          collection: 'users',
          id: existing.id,
          data: { username: account.username },
          overrideAccess: true,
        })
        backfilled += 1
      }
    }
    payload.logger.info(
      backfilled > 0
        ? `  users: already present, backfilled ${backfilled} username(s)`
        : '  users: already present, skipped',
    )
  }

  // ── Categories ─────────────────────────────────────────────────────────
  const categoryIds: Record<string, number> = {}
  for (const cat of CATEGORIES) {
    const existing = await payload.find({
      collection: 'categories',
      where: { slug: { equals: cat.slug } },
      limit: 1,
    })
    const record = existing.docs[0] ?? (await payload.create({ collection: 'categories', data: cat }))
    categoryIds[cat.slug] = record.id as number
  }
  payload.logger.info(`  categories: ${Object.keys(categoryIds).length}`)

  // ── Articles ───────────────────────────────────────────────────────────
  const articleIds: Record<string, number> = {}
  for (const article of SEED_ARTICLES) {
    const existing = await payload.find({
      collection: 'articles',
      where: { slug: { equals: article.slug } },
      limit: 1,
    })
    if (existing.docs[0]) {
      articleIds[article.slug] = existing.docs[0].id as number
      continue
    }
    const created = await payload.create({
      collection: 'articles',
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        body: article.body,
        category: categoryIds[article.category],
        author: 'Midwest Euchre Company',
        publishedAt: article.publishedAt,
        _status: 'published',
      },
    })
    articleIds[article.slug] = created.id as number
  }
  payload.logger.info(`  articles: ${Object.keys(articleIds).length}`)

  // ── Hands ──────────────────────────────────────────────────────────────
  const HANDS = [
    {
      // The exact scenario drawn in the client's mockup.
      title: 'Order up the Jack of Hearts?',
      slug: 'order-up-the-jack-of-hearts',
      publishDate: daysAgo(0),
      decisionType: 'ordering',
      difficulty: 'medium',
      scoreUs: 8,
      scoreThem: 7,
      seat: 'first',
      dealer: 'partner',
      biddingRound: 'first',
      upcard: { rank: 'J', suit: 'hearts' },
      hand: [
        { rank: 'A', suit: 'spades' },
        { rank: 'K', suit: 'spades' },
        { rank: 'Q', suit: 'spades' },
        { rank: '10', suit: 'diamonds' },
        { rank: '9', suit: 'clubs' },
      ],
      question: 'Would you order up the Jack of Hearts?',
      choices: [
        { label: 'Order it up', isCorrect: false },
        { label: 'Pass', isCorrect: true },
      ],
      expectedValue: '−0.31 points per hand if ordered',
      analysisSource: 'expert',
      methodologyNote:
        'Expert judgment, assuming standard partner play and no stick-the-dealer house rule.',
      analysis: doc([
        p(
          'Ordering here hands the right bower to your partner, which sounds appealing until you count your own trump: you have none. Not one heart, and no jack of diamonds to serve as the left bower.',
        ),
        h('What you actually hold'),
        p(
          'Three spades headed by the ace is a strong off-suit holding, but off-suit strength does not take tricks once trump has been stripped. You would be asking your partner to win three tricks essentially alone, with one known card.',
        ),
        h('The score argues against it too'),
        p(
          'At 8–7 you need two points to win. A successful order scores one and leaves you at nine. A euchre scores two for them and puts them at nine instead. The downside is larger than the upside.',
        ),
        p(
          'Pass, and let the bidding come back around. Your spades are worth far more if spades become trump on the second round.',
        ),
      ]),
      votes: { 0: 118, 1: 164 },
    },
    {
      title: 'Both bowers — go alone at 6–9 down?',
      slug: 'both-bowers-alone-at-six-nine',
      publishDate: daysAgo(7),
      decisionType: 'going-alone',
      difficulty: 'hard',
      scoreUs: 6,
      scoreThem: 9,
      seat: 'second',
      dealer: 'right-opponent',
      biddingRound: 'first',
      upcard: { rank: 'Q', suit: 'clubs' },
      hand: [
        { rank: 'J', suit: 'clubs' },
        { rank: 'J', suit: 'spades' },
        { rank: '10', suit: 'clubs' },
        { rank: 'A', suit: 'hearts' },
        { rank: '9', suit: 'diamonds' },
      ],
      question: 'They are one point from winning. Do you go alone?',
      choices: [
        { label: 'Go alone', isCorrect: true },
        { label: 'Order up with partner', isCorrect: false },
        { label: 'Pass', isCorrect: false },
      ],
      analysisSource: 'expert',
      analysis: doc([
        p(
          'At 6–9 the opponents win on their next made bid. One point does not save you; four might.',
        ),
        p(
          'Both bowers plus the ten of trump gives you three near-certain tricks, and the ace of hearts is a realistic fourth. You need the fifth to fall your way, but a normal two-point make leaves you at eight and still losing.',
        ),
      ]),
      votes: { 0: 201, 1: 74, 2: 19 },
    },
    {
      title: 'Second round: name it or pass it out?',
      slug: 'second-round-name-it-or-pass',
      publishDate: daysAgo(14),
      decisionType: 'second-round',
      difficulty: 'medium',
      scoreUs: 4,
      scoreThem: 5,
      seat: 'third',
      dealer: 'you',
      biddingRound: 'second',
      upcard: { rank: '9', suit: 'diamonds' },
      hand: [
        { rank: 'J', suit: 'spades' },
        { rank: 'A', suit: 'spades' },
        { rank: 'K', suit: 'clubs' },
        { rank: 'Q', suit: 'hearts' },
        { rank: '9', suit: 'hearts' },
      ],
      question: 'Diamonds were turned down. Do you call spades?',
      choices: [
        { label: 'Call spades', isCorrect: true },
        { label: 'Pass', isCorrect: false },
      ],
      analysisSource: 'expert',
      analysis: doc([
        p(
          'The right bower and the ace of trump is two tricks before anyone plays a card, and the king of clubs is a plausible third once the left bower is accounted for.',
        ),
        p(
          'A turned-down diamond also tells you something: nobody at the table wanted diamonds, which makes it less likely that a big diamond holding is waiting to punish you.',
        ),
      ]),
      votes: { 0: 231, 1: 46 },
    },
    {
      title: 'What do you lead against a lone hand?',
      slug: 'lead-against-a-lone-hand',
      publishDate: daysAgo(21),
      decisionType: 'opening-lead',
      difficulty: 'hard',
      scoreUs: 7,
      scoreThem: 6,
      seat: 'first',
      dealer: 'left-opponent',
      biddingRound: 'first',
      upcard: { rank: 'K', suit: 'diamonds' },
      hand: [
        { rank: 'A', suit: 'clubs' },
        { rank: '10', suit: 'clubs' },
        { rank: 'K', suit: 'spades' },
        { rank: '9', suit: 'spades' },
        { rank: '9', suit: 'diamonds' },
      ],
      question: 'The dealer went alone in diamonds. What do you lead?',
      choices: [
        { label: 'Ace of clubs', isCorrect: true },
        { label: 'Nine of diamonds', isCorrect: false },
        { label: 'King of spades', isCorrect: false },
      ],
      analysisSource: 'expert',
      analysis: doc([
        p(
          'Against a lone hand you get one realistic chance to take a trick, and it is the first one. Lead the ace and take it while you still can.',
        ),
        p(
          'Leading your singleton trump is the classic error: it strips one of your own outs and does the caller a favour by clearing the suit they want cleared.',
        ),
      ]),
      votes: { 0: 188, 1: 31, 2: 57 },
    },
    {
      title: 'Which card does the dealer discard?',
      slug: 'which-card-does-the-dealer-discard',
      publishDate: daysAgo(28),
      decisionType: 'discard',
      difficulty: 'easy',
      scoreUs: 3,
      scoreThem: 3,
      seat: 'dealer',
      dealer: 'you',
      biddingRound: 'first',
      upcard: { rank: 'A', suit: 'spades' },
      hand: [
        { rank: 'J', suit: 'spades' },
        { rank: 'K', suit: 'spades' },
        { rank: 'A', suit: 'hearts' },
        { rank: '9', suit: 'clubs' },
        { rank: '10', suit: 'clubs' },
      ],
      question: 'Your partner ordered it up. Which card goes?',
      choices: [
        { label: 'Nine of clubs', isCorrect: false },
        { label: 'Ten of clubs', isCorrect: false },
        { label: 'Either club — but void the suit', isCorrect: true },
      ],
      analysisSource: 'expert',
      analysis: doc([
        p(
          'With only two clubs, discarding one leaves you holding a lone club that can be forced out of you later. Neither club is worth keeping on its own.',
        ),
        p(
          'The real answer is to think in suits rather than cards: getting void in a suit lets you trump it. Keeping one small club achieves nothing at all.',
        ),
      ]),
      votes: { 0: 63, 1: 41, 2: 152 },
    },
    {
      title: 'Do you trump your partner’s ace?',
      slug: 'do-you-trump-your-partners-ace',
      publishDate: daysAgo(35),
      decisionType: 'defense',
      difficulty: 'medium',
      scoreUs: 5,
      scoreThem: 8,
      seat: 'second',
      dealer: 'partner',
      biddingRound: 'first',
      upcard: { rank: '10', suit: 'hearts' },
      hand: [
        { rank: '9', suit: 'hearts' },
        { rank: 'K', suit: 'diamonds' },
        { rank: 'Q', suit: 'diamonds' },
        { rank: 'A', suit: 'clubs' },
        { rank: '9', suit: 'spades' },
      ],
      question: 'Partner leads the ace of spades and you are void. Trump it?',
      choices: [
        { label: 'Trump it', isCorrect: false },
        { label: 'Throw off a diamond', isCorrect: true },
      ],
      analysisSource: 'expert',
      analysis: doc([
        p(
          'Your partner’s ace is very likely winning the trick already. Spending your only trump on a trick you were going to win is how a defending team runs out of answers by trick four.',
        ),
        p(
          'Throw the queen of diamonds, keep the nine of hearts, and save it for a trick that is actually in doubt.',
        ),
      ]),
      votes: { 0: 79, 1: 143 },
    },
  ]

  let handsCreated = 0
  let votesCreated = 0

  for (const spec of HANDS) {
    const existing = await payload.find({
      collection: 'hands',
      where: { slug: { equals: spec.slug } },
      limit: 1,
    })
    if (existing.docs[0]) continue

    const created = await payload.create({
      collection: 'hands',
      data: {
        title: spec.title,
        slug: spec.slug,
        label: 'Weekly Euchre Challenge',
        publishDate: spec.publishDate,
        decisionType: spec.decisionType as 'ordering',
        difficulty: spec.difficulty as 'medium',
        scoreUs: spec.scoreUs,
        scoreThem: spec.scoreThem,
        seat: spec.seat as 'first',
        dealer: spec.dealer as 'partner',
        biddingRound: spec.biddingRound as 'first',
        upcard: spec.upcard as { rank: 'J'; suit: 'hearts' },
        hand: spec.hand as { rank: 'A'; suit: 'spades' }[],
        question: spec.question,
        choices: spec.choices,
        expertAnalysis: spec.analysis,
        expectedValue: spec.expectedValue ?? null,
        analysisSource: (spec.analysisSource ?? 'expert') as 'expert',
        methodologyNote: spec.methodologyNote ?? null,
        votingOpen: true,
        showResults: true,
        _status: 'published',
      },
    })
    handsCreated += 1

    // Pre-seeded votes so percentages look like a real audience on first load.
    for (const [choiceIndex, count] of Object.entries(spec.votes)) {
      for (let i = 0; i < (count as number); i++) {
        await payload.create({
          collection: 'votes',
          data: {
            hand: created.id,
            choiceIndex: Number(choiceIndex),
            voterHash: createHash('sha256').update(`seed:${created.id}:${randomUUID()}`).digest('hex'),
          },
          overrideAccess: true,
        })
        votesCreated += 1
      }
    }
  }
  payload.logger.info(`  hands: ${handsCreated} created, ${votesCreated} votes seeded`)

  // ── Globals ────────────────────────────────────────────────────────────
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      heroHeading: 'Everything Euchre.\nAll in One Place.',
      heroSubheading:
        'Learn the game, sharpen your strategy, and join the next generation of euchre.',
      heroCtaLabel: 'Explore Euchre',
      heroCtaHref: '/hands',
      featuredArticle: articleIds['euchre-scoring-explained'],
      appBannerEnabled: true,
      appBannerHeading: 'Meet Euchre Next',
      appBannerSubheading: 'A smarter way to play, learn, and compete.',
      appBannerCtaLabel: 'Coming Soon',
      appBannerCtaHref: '#',
    },
  })

  await payload.updateGlobal({
    slug: 'navigation',
    data: {
      headerLinks: [
        { label: "Today's Hand", href: '/hands' },
        { label: 'Strategy', href: '/category/strategy' },
        { label: 'Learn', href: '/category/learn' },
        { label: 'Rules', href: '/category/rules' },
      ],
      headerCta: { label: 'Euchre Next', href: '#euchre-next' },
      footerLinks: [
        { label: 'About', href: '/about' },
        { label: 'Past Hands', href: '/hands' },
        { label: 'Learn', href: '/category/learn' },
        { label: 'Strategy', href: '/category/strategy' },
      ],
      socialLinks: [{ platform: 'facebook' as const, href: '#' }],
    },
  })
  payload.logger.info('  globals: homepage + navigation set')

  payload.logger.info('Seed complete.')
  process.exit(0)
}

// Top-level await, not `run().catch()` — `payload run` finishes as soon as the
// module finishes evaluating, so a floating promise is silently abandoned.
try {
  await run()
} catch (err) {
  console.error(err)
  process.exit(1)
}
