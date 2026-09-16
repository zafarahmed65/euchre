# Midwest Euchre Company — demo

**Live:** https://midwest-euchre.up.railway.app
**Admin:** https://midwest-euchre.up.railway.app/admin

A working demo of the Midwest Euchre Company website, built to the client's
"Website Design & Build Brief" (September 2026), on **Next.js 16 + Payload CMS 3**,
deployed on Railway with Railway Postgres.

It implements the approved Concept A visual direction, the weekly **Today's Hand**
feature with live voting, and the Payload admin the owner would publish from.

---

## Running it

```bash
npm install
npm run seed     # creates the database, users and demo content
npm run dev      # http://localhost:3000
```

No database server is required locally — it runs on SQLite by default.

### Demo logins

Sign in with a **username**, not an email address.

| Role | Username | Password |
|---|---|---|
| Owner (admin) | `owner` | `euchre2026` |
| Editor | `editor` | `euchre2026` |

Each account still stores an email, because Payload needs one to send a password
reset, but it is never typed at the login screen.

The editor can create and publish content but cannot see the Users collection —
the brief requires an editor account that does not share the owner login.

> These are demo credentials for a throwaway local database. Real credentials are
> generated at deployment and never committed.

---

## What to show the client

1. **`/admin` → Today's Hands → any hand.** The scenario is a form in three tabs:
   *The Situation*, *Question & Choices*, *Expert Analysis*. Cards are dropdowns —
   each collapsed row reads "A♠ Ace of Spades", so the whole hand is legible at a
   glance. Nothing is designed; everything is filled in.
2. **Duplicate a hand, change a few cards, publish.** It becomes Today's Hand on the
   homepage and the previous one appears in the archive. There is no cron job and
   nothing for the owner to remember: "current" is simply the newest published hand
   whose date has arrived.
3. **Vote on a phone-width window.** Percentages appear with **zero layout shift** —
   an explicit acceptance criterion in the brief, and the thing a cached CMS
   typically gets wrong.
4. **Untick "Voting open" or "Show results"** in the sidebar and reload — the reader
   view changes immediately.
5. **`/hands`** — archive filters by decision type. Each filter is its own
   shareable, indexable URL and works without JavaScript.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Homepage — hero, Today's Hand, Featured, Latest, app banner |
| `/hand/[slug]` | Permanent per-hand page — the link for email campaigns |
| `/hands` | Past Hands & Decisions, filterable by decision type |
| `/articles/[slug]` | Article with table of contents and reading time |
| `/category/[slug]` | Category archive |
| `/admin` | Payload CMS |
| `/api/vote` | Voting endpoint (never cached) |

---

## Notable decisions

**Cards are drawn, not photographed.** The commissioned Euchre Next artwork does not
exist yet, and the brief forbids copying Bicycle or other protected decks. Every card
is an SVG component (`src/components/cards/PlayingCard.tsx`), so the demo ships with
no licensing risk, stays sharp at any size, costs no image requests against the 2.5s
LCP budget, and swaps to the real artwork by editing one file. Article thumbnails use
the same cards on felt, so there are **no stock photos anywhere**.

**Archiving is a query, not a job.** See `getCurrentHand()` in `src/lib/data.ts`.

**Voting is cached-page-safe.** The hand page is statically rendered; the vote panel
is a client component talking to a `force-dynamic` route. The results area reserves
its final height before data arrives, so CLS is zero.

**Vote identity is anonymous.** A vote stores only a SHA-256 of an anonymous cookie
id, the hand, and a server salt. No IP, no email, nothing reversible — the brief
requires that results never expose personal information. Duplicate prevention is
deliberately *reasonable*, not ballot-grade, exactly as the brief describes.

**Accessibility.** Every card announces as "Ace of Spades"; suits carry shape as well
as colour; the selected answer is marked with a tick and text, never colour alone;
tap targets are ≥44×44px; `prefers-reduced-motion` is honoured.

---

## Deployment

Deployed on Railway: a `web` service and a Railway Postgres service in the
`midwest-euchre` project. The database adapter is chosen from `DATABASE_URI` in
`src/payload.config.ts` — a `postgres://` string uses Postgres, anything else uses
SQLite — so local development needs no database server.

Two things about Railway shaped the setup, and both are worth knowing before
touching it:

**The database does not exist during a build.** Railway's private network is a
runtime-only facility, so `postgres.railway.internal` does not resolve while the
image is being built. Anything that queried the database while prerendering took
the build down. `generateStaticParams` now returns an empty list on failure, the
homepage and archive render per request, and the CMS globals fall back to their
declared defaults. Where the database *is* reachable at build time — locally, or
on Vercel — every path still prerenders exactly as before.

**The schema builds itself on first boot.** This demo carries no migration
history, and `@payloadcms/db-postgres` only pushes a schema when
`NODE_ENV !== 'production'`. So `scripts/start.mjs` runs the seed as a
development-mode child process, which is enough for Payload to create the tables,
then starts Next in production. A real build would generate migrations with
`payload migrate:create` and drop that entirely.

Environment variables on the `web` service:

| Variable | Notes |
|---|---|
| `DATABASE_URI` | `${{Postgres.DATABASE_URL}}` — a Railway reference, so it tracks the database |
| `PAYLOAD_SECRET` | long random string |
| `VOTE_SALT` | random string; changing it resets duplicate-vote detection |
| `NEXT_PUBLIC_SERVER_URL` | the deployed URL |
| `SEED_OWNER_USERNAME` / `SEED_EDITOR_USERNAME` | admin login names |
| `SEED_OWNER_PASSWORD` / `SEED_EDITOR_PASSWORD` | admin passwords |

Redeploy with `railway up --service web`. Uploads are still local-disk only; a
deployment that needs media uploads to survive restarts requires an object-storage
adapter (Railway volumes, S3, or Vercel Blob).

---

## Not in this demo

Privacy / Terms / Newsletter / Contact / Search / 404 pages; the real card artwork;
an email service provider; a live GA4 property (events are structured, not wired);
consent banner; content migration; staging environment; production security
hardening. These belong in the paid build.
