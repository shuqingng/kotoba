'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { ReadingCard } from '@/lib/reading-sheets'


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
function ReadingRow({ card, onDelete }: { card: ReadingCard; onDelete: (id: string) => void }) {
  return (
    <tr className="group border-b border-gold/10 hover:bg-gold/5 transition-colors">
      <td className="pl-5 py-3 pr-4 border-l border-gold/15">
        <span className="font-jp text-xl text-navy">{card.japanese}</span>
      </td>
      <td className="py-3 pr-4">
        <span className="font-jp text-sm text-muted">{card.reading}</span>
      </td>
      <td className="py-3 pl-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(card.id)}
          className="text-muted hover:text-vermilion transition-colors text-xs px-2 py-1 rounded hover:bg-vermilion/10"
          title="Delete"
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

// ─── Section table ────────────────────────────────────────────────────────────
function CardTable({
  title, kana, cards, onDelete,
}: {
  title:    string
  kana:     string
  cards:    ReadingCard[]
  onDelete: (id: string) => void
}) {
  if (cards.length === 0) return null
  return (
    <div className="bg-white rounded-2xl border border-gold/20 shadow-card overflow-hidden">
      <div className="px-5 py-3 border-b border-gold/10 flex items-center gap-3">
        <span className="font-jp text-lg text-navy font-medium">{kana}</span>
        <span className="text-sm text-muted">{title}</span>
        <span className="ml-auto text-xs text-muted bg-gold/10 px-2 py-0.5 rounded-full">
          {cards.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gold/10 text-xs text-muted uppercase tracking-wider">
              <th className="text-left pl-5 pr-4 py-2.5 font-medium border-l border-gold/15">Word</th>
              <th className="text-left pr-4 py-2.5 font-medium">Reading</th>
              <th className="py-2.5" />
            </tr>
          </thead>
          <tbody>
            {cards.map(c => (
              <ReadingRow key={c.id} card={c} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ReadingPage() {
  const [cards,   setCards]   = useState<ReadingCard[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => {
    fetch('/api/reading')
      .then(r => r.json())
      .then(setCards)
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reading card?')) return
    await fetch(`/api/reading/${id}`, { method: 'DELETE' })
    setCards(c => c.filter(e => e.id !== id))
  }

  const now = new Date()
  const due = cards.filter(c => new Date(c.next_review) <= now)

  const filtered = cards.filter(c =>
    !search ||
    c.japanese.includes(search) ||
    c.reading.toLowerCase().includes(search.toLowerCase())
  )

  const sortCards = (list: ReadingCard[]) =>
    [...list].sort((a, b) => {
      const aDue = new Date(a.next_review) <= now
      const bDue = new Date(b.next_review) <= now
      if (aDue !== bDue) return aDue ? -1 : 1
      return new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
    })

  const hiragana = sortCards(filtered.filter(c => c.language === 'hiragana'))
  const katakana = sortCards(filtered.filter(c => c.language === 'katakana'))
  const other    = sortCards(filtered.filter(c => c.language === ''))

  const isEmpty = filtered.length === 0

  return (
    <div className="animate-fade-in space-y-8">

      {/* Hero */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-jp text-5xl text-navy font-medium leading-tight">読み</h1>
          <p className="text-muted text-sm mt-1">Reading practice library</p>
        </div>
        {due.length > 0 && (
          <Link
            href="/reading/review"
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
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Total"    value={cards.length} />
        <Stat label="ひらがな" value={cards.filter(c => c.language === 'hiragana').length} />
        <Stat label="カタカナ" value={cards.filter(c => c.language === 'katakana').length} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search words or readings…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 text-sm border border-gold/20 rounded-xl px-4 py-2 bg-white
                     placeholder:text-muted/50 focus:outline-none focus:border-gold
                     focus:ring-1 focus:ring-gold/30 transition"
        />
        <Link
          href="/reading/add"
          className="text-sm bg-navy hover:bg-navy/80 text-paper px-4 py-2
                     rounded-xl font-medium transition-colors whitespace-nowrap"
        >
          + Add card
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-16 text-center text-muted text-sm">Loading…</div>
      ) : isEmpty ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gold/20 shadow-card">
          <p className="font-jp text-4xl text-gold/30 mb-3">読み</p>
          <p className="text-muted text-sm">
            {search ? 'No cards match your search.' : 'No reading cards yet — add your first one!'}
          </p>
          {!search && (
            <Link href="/reading/add" className="mt-4 inline-block text-sm text-vermilion hover:underline">
              Add a card →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          <CardTable title="Hiragana" kana="ひらがな" cards={hiragana} onDelete={handleDelete} />
          <CardTable title="Katakana" kana="カタカナ" cards={katakana} onDelete={handleDelete} />
          <CardTable title="Other"    kana="他"       cards={other}    onDelete={handleDelete} />
        </div>
      )}

    </div>
  )
}
