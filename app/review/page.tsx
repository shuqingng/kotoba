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
  onSpeak,
}: {
  entry:    VocabEntry
  flipped:  boolean
  onClick:  () => void
  onSpeak:  () => void
}) {
  const [showReading, setShowReading] = useState(false)

  // Reset reading visibility when card changes
  useEffect(() => { setShowReading(false) }, [entry])

  // 'r' to reveal reading while on the front
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!flipped && e.key === 'r') setShowReading(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [flipped])

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
          <button
            onClick={e => { e.stopPropagation(); onSpeak() }}
            className="text-muted/30 hover:text-muted transition-colors"
            aria-label="Repeat pronunciation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" />
              <path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" />
            </svg>
          </button>
          <span className="font-jp text-6xl text-navy font-medium leading-tight text-center">
            {entry.japanese}
          </span>
          {entry.reading && (
            showReading
              ? <span className="font-jp text-lg text-muted animate-fade-in">{entry.reading}</span>
              : <button
                  onClick={e => { e.stopPropagation(); setShowReading(true) }}
                  className="text-xs text-muted/50 hover:text-muted border border-muted/20 hover:border-muted/40
                             rounded-lg px-3 py-1 transition-colors"
                >
                  show reading <span className="opacity-50">(r)</span>
                </button>
          )}
          <span className="text-xs text-muted/50">tap to reveal →</span>
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

  // Speak the Japanese word
  const speak = useCallback((text: string) => {
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = 'ja-JP'
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utter)
  }, [])

  // Auto-speak on new card
  useEffect(() => {
    if (current?.japanese) speak(current.japanese)
  }, [current?.id])

  // 'p' to repeat pronunciation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'p' && current?.japanese) speak(current.japanese) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [current?.japanese, speak])

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
      <FlashCard entry={current} flipped={flipped} onClick={() => setFlipped(f => !f)} onSpeak={() => speak(current.japanese)} />

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
