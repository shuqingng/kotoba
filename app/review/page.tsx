'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { VocabEntry } from '@/lib/sheets'
import type { ReviewQuality } from '@/lib/sm2'

// ─── Flashcard ────────────────────────────────────────────────────────────────
function FlashCard({
  entry,
  flipped,
  onClick,
}: {
  entry:   VocabEntry
  flipped: boolean
  onClick: () => void
}) {
  return (
    <div
      className="perspective w-full cursor-pointer select-none"
      style={{ height: 320 }}
      onClick={onClick}
      role="button"
      aria-label={flipped ? 'Card flipped — showing answer' : 'Click to reveal answer'}
    >
      <div className={`card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>

        {/* Front – Japanese */}
        <div className="card-face bg-white rounded-2xl border border-gold/20 shadow-card
                        flex flex-col items-center justify-center p-8 gap-4">
          <span className="text-xs uppercase tracking-widest text-muted">What does this mean?</span>
          <span className="font-jp text-6xl text-navy font-medium leading-tight text-center">
            {entry.japanese}
          </span>
          {entry.reading && (
            <span className="font-jp text-lg text-muted">{entry.reading}</span>
          )}
          <span className="mt-4 text-xs text-muted/50">tap to reveal →</span>
        </div>

        {/* Back – English */}
        <div className="card-face card-back bg-navy rounded-2xl border border-navy
                        shadow-card flex flex-col items-center justify-center p-8 gap-4">
          <span className="text-xs uppercase tracking-widest text-gold/60">Meaning</span>
          <span className="text-3xl text-paper font-medium text-center leading-snug">
            {entry.english}
          </span>
          <div className="border-t border-white/10 pt-4 mt-2 text-center">
            <span className="font-jp text-2xl text-gold/80">{entry.japanese}</span>
            {entry.reading && (
              <span className="font-jp text-sm text-paper/50 block mt-1">{entry.reading}</span>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Rating buttons ───────────────────────────────────────────────────────────
const RATINGS: { quality: ReviewQuality; label: string; desc: string; color: string }[] = [
  { quality: 'again', label: 'Again',  desc: 'Forgot it',       color: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-200' },
  { quality: 'hard',  label: 'Hard',   desc: 'Got it, barely',  color: 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200' },
  { quality: 'good',  label: 'Good',   desc: 'Got it',          color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200' },
  { quality: 'easy',  label: 'Easy',   desc: 'Too easy',        color: 'bg-sky-100 hover:bg-sky-200 text-sky-800 border-sky-200' },
]

// ─── Done screen ──────────────────────────────────────────────────────────────
function DoneScreen({ reviewed }: { reviewed: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 animate-fade-in">
      <span className="font-jp text-6xl text-gold">完了</span>
      <div className="text-center space-y-1">
        <p className="text-2xl font-medium text-navy">Session complete!</p>
        <p className="text-muted text-sm">
          You reviewed {reviewed} {reviewed === 1 ? 'card' : 'cards'}.
        </p>
      </div>
      <div className="flex gap-3 mt-4">
        <Link
          href="/"
          className="border border-gold/30 text-navy hover:bg-gold/10 px-5 py-2.5
                     rounded-xl font-medium text-sm transition-colors"
        >
          Back to library
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="bg-navy hover:bg-navy/80 text-paper px-5 py-2.5
                     rounded-xl font-medium text-sm transition-colors"
        >
          Review again
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const [queue,    setQueue]    = useState<VocabEntry[]>([])
  const [loading,  setLoading]  = useState(true)
  const [flipped,  setFlipped]  = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [done,     setDone]     = useState(false)

  useEffect(() => {
    fetch('/api/vocab')
      .then(r => r.json())
      .then((all: VocabEntry[]) => {
        const now = new Date()
        const due = all
          .filter(v => new Date(v.next_review) <= now)
          .sort(() => Math.random() - 0.5) // shuffle
        setQueue(due)
        if (due.length === 0) setDone(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const current = queue[0]
  const remaining = queue.length

  const handleRate = useCallback((quality: ReviewQuality) => {
    if (!current || submitting) return
    setSubmitting(true)

    // Update UI immediately — no waiting on the network
    setReviewed(n => n + 1)
    setFlipped(false)
    const next = queue.slice(1)
    setTimeout(() => {
      if (quality === 'again') {
        setQueue([...next, current])
      } else {
        setQueue(next)
        if (next.length === 0) setDone(true)
      }
      setSubmitting(false)
    }, 260)

    // Save in background — fire and forget
    fetch(`/api/review/${current.id}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ quality }),
    }).catch(err => console.error('[review]', err))
  }, [current, queue, submitting])

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!flipped) {
        if (e.key === ' ' || e.key === 'Enter') setFlipped(true)
        return
      }
      if (e.key === '1') handleRate('again')
      if (e.key === '2') handleRate('hard')
      if (e.key === '3') handleRate('good')
      if (e.key === '4') handleRate('easy')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flipped, handleRate])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted text-sm">
        Loading your review session…
      </div>
    )
  }

  if (done || queue.length === 0) {
    return <DoneScreen reviewed={reviewed} />
  }

  // Progress = cards reviewed in this pass (not counting re-queued 'again' cards)
  const total    = reviewed + remaining
  const progress = Math.round((reviewed / Math.max(total, 1)) * 100)

  return (
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-medium text-navy">Review session</h1>
          <p className="text-xs text-muted">
            {remaining} card{remaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
        <span className="font-jp text-sm text-muted">{reviewed} done</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gold/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <FlashCard entry={current} flipped={flipped} onClick={() => setFlipped(f => !f)} />

      {/* Rating buttons */}
      <div className={`transition-opacity duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <p className="text-xs text-center text-muted mb-3">
          How well did you know this? <span className="opacity-50">(or press 1–4)</span>
        </p>
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map(({ quality, label, desc, color }) => (
            <button
              key={quality}
              onClick={() => handleRate(quality)}
              disabled={submitting}
              className={`
                flex flex-col items-center gap-0.5 py-3 px-2 rounded-xl border font-medium
                text-sm transition-all duration-150 disabled:opacity-50 ${color}
              `}
            >
              <span>{label}</span>
              <span className="text-xs font-normal opacity-60">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flip hint */}
      {!flipped && (
        <p className="text-xs text-center text-muted/50 animate-fade-in">
          Space / Enter to flip
        </p>
      )}

    </div>
  )
}
