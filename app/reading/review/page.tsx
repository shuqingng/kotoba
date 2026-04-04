'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { ReadingCard } from '@/lib/reading-sheets'
import type { ReviewQuality } from '@/lib/sm2'

// ─── Flashcard ────────────────────────────────────────────────────────────────
function FlashCard({
  card,
  flipped,
  onClick,
}: {
  card:    ReadingCard
  flipped: boolean
  onClick: () => void
}) {
  return (
    <div
      className="perspective w-full cursor-pointer select-none"
      style={{ height: 320 }}
      onClick={onClick}
      role="button"
      aria-label={flipped ? 'Card flipped — showing reading' : 'Click to reveal reading'}
    >
      <div className={`card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>

        {/* Front – Kanji only */}
        <div className="card-face bg-white rounded-2xl border border-gold/20 shadow-card
                        flex flex-col items-center justify-center p-8 gap-4">
          <span className="text-xs uppercase tracking-widest text-muted">How do you read this?</span>
          <span className="font-jp text-7xl text-navy font-medium leading-tight text-center">
            {card.japanese}
          </span>
          <span className="mt-4 text-xs text-muted/50">tap to reveal →</span>
        </div>

        {/* Back – Reading + meaning */}
        <div className="card-face card-back bg-navy rounded-2xl border border-navy
                        shadow-card flex flex-col items-center justify-center p-8 gap-3">
          <span className="text-xs uppercase tracking-widest text-gold/60">Reading</span>
          <span className="font-jp text-5xl text-gold font-medium text-center leading-tight">
            {card.reading}
          </span>
          <div className="border-t border-white/10 pt-3 mt-1 text-center space-y-1">
            <span className="font-jp text-2xl text-paper/80">{card.japanese}</span>
            {card.english && (
              <p className="text-paper/50 text-sm">{card.english}</p>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Rating buttons ───────────────────────────────────────────────────────────
const RATINGS: { quality: ReviewQuality; label: string; desc: string; color: string }[] = [
  { quality: 'again', label: 'Again', desc: 'Forgot it',     color: 'bg-red-100 hover:bg-red-200 text-red-800 border-red-200' },
  { quality: 'hard',  label: 'Hard',  desc: 'Barely got it', color: 'bg-orange-100 hover:bg-orange-200 text-orange-800 border-orange-200' },
  { quality: 'good',  label: 'Good',  desc: 'Got it',        color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200' },
  { quality: 'easy',  label: 'Easy',  desc: 'Too easy',      color: 'bg-sky-100 hover:bg-sky-200 text-sky-800 border-sky-200' },
]

// ─── Done screen ──────────────────────────────────────────────────────────────
function DoneScreen({ reviewed }: { reviewed: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16 animate-fade-in">
      <span className="font-jp text-6xl text-gold">完了</span>
      <div className="text-center space-y-1">
        <p className="text-2xl font-medium text-navy">Session complete!</p>
        <p className="text-muted text-sm">
          You read {reviewed} {reviewed === 1 ? 'card' : 'cards'}.
        </p>
      </div>
      <div className="flex gap-3 mt-4">
        <Link
          href="/reading"
          className="border border-gold/30 text-navy hover:bg-gold/10 px-5 py-2.5
                     rounded-xl font-medium text-sm transition-colors"
        >
          Back to reading list
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
export default function ReadingReviewPage() {
  const [queue,      setQueue]      = useState<ReadingCard[]>([])
  const [loading,    setLoading]    = useState(true)
  const [flipped,    setFlipped]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviewed,   setReviewed]   = useState(0)
  const [done,       setDone]       = useState(false)

  useEffect(() => {
    fetch('/api/reading')
      .then(r => r.json())
      .then((all: ReadingCard[]) => {
        const now = new Date()
        const due = all
          .filter(c => new Date(c.next_review) <= now)
          .sort(() => Math.random() - 0.5)
        setQueue(due)
        if (due.length === 0) setDone(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const current   = queue[0]
  const remaining = queue.length

  const handleRate = useCallback(async (quality: ReviewQuality) => {
    if (!current || submitting) return
    setSubmitting(true)
    try {
      await fetch(`/api/reading/review/${current.id}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ quality }),
      })
      setReviewed(n => n + 1)
      setFlipped(false)
      const next = queue.slice(1)
      if (quality === 'again') {
        setQueue([...next, current])
      } else {
        setQueue(next)
        if (next.length === 0) setDone(true)
      }
    } finally {
      setSubmitting(false)
    }
  }, [current, queue, submitting])

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
        Loading reading session…
      </div>
    )
  }

  if (done || queue.length === 0) {
    return <DoneScreen reviewed={reviewed} />
  }

  const total    = reviewed + remaining
  const progress = Math.round((reviewed / Math.max(total, 1)) * 100)

  return (
    <div className="animate-fade-in max-w-lg mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-medium text-navy">
            Reading practice{' '}
            <span className="font-jp text-muted font-normal">読み練習</span>
          </h1>
          <p className="text-xs text-muted">
            {remaining} card{remaining !== 1 ? 's' : ''} remaining
          </p>
        </div>
        <span className="font-jp text-sm text-muted">{reviewed} done</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gold/15 rounded-full overflow-hidden">
        <div
          className="h-full bg-vermilion rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <FlashCard card={current} flipped={flipped} onClick={() => setFlipped(f => !f)} />

      {/* Rating buttons */}
      <div className={`transition-opacity duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <p className="text-xs text-center text-muted mb-3">
          Did you know the reading? <span className="opacity-50">(or press 1–4)</span>
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

      {!flipped && (
        <p className="text-xs text-center text-muted/50 animate-fade-in">
          Space / Enter to flip
        </p>
      )}

    </div>
  )
}
