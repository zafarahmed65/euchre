'use client'

import { useEffect, useRef, useState } from 'react'

type Choice = { label: string; isCorrect?: boolean | null; id?: string | null }

type Results = {
  counts: number[]
  percentages: number[]
  total: number
  hasVoted: boolean
  votedFor: number | null
  votingOpen: boolean
  showResults: boolean
}

type Props = {
  handId: number | string
  choices: Choice[]
  votingOpen: boolean
  showResults: boolean
  /** The permanent hand page marks the recommended play once the reader has voted. */
  revealCorrect?: boolean
  theme?: 'navy' | 'light'
}

/** Every row is exactly this tall in every state — button, bar, or skeleton. */
const ROW_H = 56

export function VotePanel({
  handId,
  choices,
  votingOpen,
  showResults,
  revealCorrect = false,
  theme = 'navy',
}: Props) {
  const [results, setResults] = useState<Results | null>(null)
  const [pending, setPending] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  // Set synchronously, unlike state — two clicks in the same tick would both read
  // the pre-update `pending` and fire two requests.
  const submitting = useRef(false)

  // Tallies are fetched after mount so the page itself stays statically cached.
  // This request also establishes the anonymous voter cookie.
  useEffect(() => {
    let active = true
    fetch(`/api/vote?handId=${handId}`)
      .then((r) => r.json())
      .then((data: Results) => {
        if (active && !('error' in data)) setResults(data)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [handId])

  const castVote = async (choiceIndex: number) => {
    if (submitting.current || results?.hasVoted || !votingOpen) return
    submitting.current = true
    setPending(choiceIndex)
    setMessage(null)

    try {
      // If the mount fetch has not landed yet, run it now — it is what sets the
      // voter cookie, and voting without one is how a double click becomes two votes.
      if (!results) {
        await fetch(`/api/vote?handId=${handId}`).catch(() => {})
      }

      const post = () =>
        fetch('/api/vote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ handId, choiceIndex }),
        })

      let res = await post()
      // 428 means the server just issued a voter cookie; retry once, now carrying it.
      if (res.status === 428) res = await post()

      const data = await res.json()

      if (data.counts) setResults(data)
      if (data.notice) setMessage(data.notice)
      else if (data.error) setMessage(data.error)
    } catch {
      setMessage('Something went wrong. Please try again.')
    } finally {
      submitting.current = false
      setPending(null)
    }
  }

  const voted = results?.hasVoted ?? false
  const showBars = voted && showResults && results !== null
  const closed = !votingOpen

  const dark = theme === 'navy'
  const trackBg = dark ? 'bg-white/10' : 'bg-navy/10'
  const barBg = dark ? 'bg-gold/85' : 'bg-gold'
  const textOn = dark ? 'text-white' : 'text-navy'
  const subText = dark ? 'text-cream/70' : 'text-ink-muted'

  return (
    <div>
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {choices.map((choice, i) => {
          const pct = results?.percentages[i] ?? 0
          const isChoice = results?.votedFor === i
          const isRecommended = revealCorrect && voted && choice.isCorrect === true

          return (
            <li key={choice.id ?? i} style={{ height: ROW_H }}>
              {showBars ? (
                // ── Result bar ──────────────────────────────────────────────
                <div
                  className={`relative flex h-full items-center overflow-hidden rounded-full border-2 ${
                    isChoice ? 'border-gold' : dark ? 'border-white/25' : 'border-navy/20'
                  }`}
                >
                  <div
                    className={`absolute inset-y-0 left-0 ${barBg} transition-[width] duration-500`}
                    style={{ width: `${pct}%` }}
                    aria-hidden="true"
                  />
                  <div className={`relative flex w-full items-center justify-between gap-3 px-4 ${textOn}`}>
                    <span className="flex min-w-0 items-center gap-2 font-bold">
                      {/* Selection is marked by a tick and by text, never by colour alone. */}
                      {isChoice && (
                        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0">
                          <path
                            d="M2 8.5l4 4 8-9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <span className="truncate">{choice.label}</span>
                      {isChoice && <span className="sr-only">— your vote</span>}
                      {isRecommended && (
                        <span className="shrink-0 rounded-full bg-navy px-2 py-0.5 text-[10px] font-bold tracking-wide text-gold uppercase">
                          Recommended
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-bold tabular-nums">{pct}%</span>
                  </div>
                </div>
              ) : (
                // ── Vote button ─────────────────────────────────────────────
                <button
                  type="button"
                  onClick={() => castVote(i)}
                  disabled={closed || pending !== null}
                  className={`tap-target h-full w-full rounded-full border-2 px-4 text-base font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                    i === 0
                      ? 'border-gold bg-gold text-navy hover:bg-gold-deep'
                      : dark
                        ? 'border-gold/70 text-cream hover:bg-white/10'
                        : 'border-navy/30 text-navy hover:bg-navy/5'
                  }`}
                >
                  {pending === i ? 'Recording…' : choice.label}
                </button>
              )}
            </li>
          )
        })}
      </ul>

      {/* Status line height is reserved up front, so nothing below it ever moves. */}
      <p className={`mt-3 min-h-10 text-sm ${subText}`} role="status" aria-live="polite">
        {closed
          ? 'Voting is closed on this hand.'
          : message
            ? message
            : showBars
              ? `${results!.total.toLocaleString()} ${results!.total === 1 ? 'response' : 'responses'} so far.`
              : voted && !showResults
                ? 'Thanks — your vote was recorded.'
                : 'Vote, then see how other players answered.'}
      </p>
    </div>
  )
}
