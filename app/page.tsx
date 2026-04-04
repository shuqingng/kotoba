'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { VocabEntry } from '@/lib/sheets'

// ─── Stat card ────────────────────────────────────────────────────────────────
function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={`
      rounded-xl border px-5 py-4 flex flex-col gap-1
      ${accent ? 'bg-vermilion text-white border-vermilion' : 'bg-white border-gold/20'}
    `}>
      <span className={`text-3xl font-bold font-jp ${accent ? 'text-white' : 'text-navy'}`}>
        {value}
      </span>
      <span className={`text-xs uppercase tracking-widest ${accent ? 'text-white/70' : 'text-muted'}`}>
        {label}
      </span>
    </div>
  )
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function VocabRow({
  entry,
  onDelete,
}: {
  entry:    VocabEntry
  onDelete: (id: string) => void
}) {
  return (
    <tr className="group border-b border-gold/10 hover:bg-gold/5 transition-colors">
      <td className="pl-5 py-3 pr-4 border-l border-gold/15">
        <span className="font-jp text-xl text-navy">{entry.japanese}</span>
      </td>
      <td className="py-3 pr-4">
        <span className="font-jp text-sm text-muted">{entry.reading}</span>
      </td>
      <td className="py-3 pr-4 text-sm">{entry.english}</td>
      <td className="py-3 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(entry.id)}
          className="text-muted hover:text-vermilion transition-colors text-xs px-2 py-1 rounded hover:bg-vermilion/10"
          title="Delete"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [vocab,   setVocab]   = useState<VocabEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    fetch('/api/vocab')
      .then(r => r.json())
      .then(setVocab)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this word?')) return
    await fetch(`/api/vocab/${id}`, { method: 'DELETE' })
    setVocab(v => v.filter(e => e.id !== id))
  }

  const now     = new Date()
  const due     = vocab.filter(v => new Date(v.next_review) <= now)
  const filtered = vocab.filter(v =>
    !search ||
    v.japanese.includes(search) ||
    v.reading.toLowerCase().includes(search.toLowerCase()) ||
    v.english.toLowerCase().includes(search.toLowerCase())
  )

  // Sort: due first, then by next_review ascending
  const sorted = [...filtered].sort((a, b) => {
    const aDue = new Date(a.next_review) <= now
    const bDue = new Date(b.next_review) <= now
    if (aDue !== bDue) return aDue ? -1 : 1
    return new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
  })

  return (
    <div className="animate-fade-in space-y-8">

      {/* Hero */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-jp text-5xl text-navy font-medium leading-tight">
            言葉
          </h1>
          <p className="text-muted text-sm mt-1">Your Japanese vocabulary library</p>
        </div>
        {due.length > 0 && (
          <Link
            href="/review"
            className="flex items-center gap-2 bg-vermilion hover:bg-vermilion/90
                       text-white px-5 py-2.5 rounded-xl font-medium text-sm
                       shadow-card hover:shadow-card-hover transition-all duration-200"
          >
            <span>Review</span>
            <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
              {due.length}
            </span>
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Total words"    value={vocab.length} />
        <Stat label="Mastered (7d+)" value={vocab.filter(v => v.interval >= 7).length} />
      </div>

      {/* Library */}
      <div className="bg-white rounded-2xl border border-gold/20 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-gold/10 flex items-center gap-3">
          <h2 className="font-medium text-navy flex-1">Library</h2>
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="text-sm border border-gold/20 rounded-lg px-3 py-1.5 bg-paper
                       placeholder:text-muted/50 focus:outline-none focus:border-gold
                       focus:ring-1 focus:ring-gold/30 w-48 transition"
          />
          <Link
            href="/add"
            className="text-sm bg-navy hover:bg-navy/80 text-paper px-3 py-1.5
                       rounded-lg font-medium transition-colors"
          >
            + Add
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center text-muted text-sm">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-jp text-4xl text-gold/30 mb-3">言葉</p>
            <p className="text-muted text-sm">
              {search ? 'No words match your search.' : 'No words yet — add your first one!'}
            </p>
            {!search && (
              <Link href="/add" className="mt-4 inline-block text-sm text-vermilion hover:underline">
                Add a word →
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10 text-xs text-muted uppercase tracking-wider">
                  <th className="text-left pl-5 pr-4 py-3 font-medium border-l border-gold/15">
                    Word
                  </th>
                  <th className="text-left pr-4 py-3 font-medium">Reading</th>
                  <th className="text-left pr-4 py-3 font-medium">Meaning</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody className="px-5">
                {sorted.map(v => (
                  <VocabRow key={v.id} entry={v} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  )
}
