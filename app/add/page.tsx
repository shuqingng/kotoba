'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Field = 'japanese' | 'reading' | 'english'

const PLACEHOLDERS: Record<Field, string> = {
  japanese: '例：勉強',
  reading:  'べんきょう',
  english:  'studying, to study',
}

const LABELS: Record<Field, string> = {
  japanese: 'Japanese word',
  reading:  'Reading (furigana)',
  english:  'English meaning',
}

export default function AddPage() {
  const router = useRouter()
  const [form, setForm] = useState({ japanese: '', reading: '', english: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [saved,  setSaved]  = useState(false)

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault()
    if (!form.japanese.trim() || !form.english.trim()) {
      setError('Japanese word and English meaning are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/vocab', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())

      if (addAnother) {
        setForm({ japanese: '', reading: '', english: '' })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        router.push('/')
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  const field = (name: Field) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium uppercase tracking-widest text-muted">
        {LABELS[name]}
      </label>
      <input
        type="text"
        value={form[name]}
        placeholder={PLACEHOLDERS[name]}
        onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
        className={`
          border border-gold/25 rounded-xl px-4 py-3 bg-white
          focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20
          placeholder:text-muted/40 transition
          ${name === 'japanese' ? 'font-jp text-2xl text-navy' : 'text-base'}
        `}
      />
    </div>
  )

  return (
    <div className="animate-fade-in max-w-lg mx-auto">

      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-jp text-4xl text-navy font-medium">新しい言葉</h1>
        <p className="text-muted text-sm mt-1">Add a new word to your library</p>
      </div>

      {/* Preview card */}
      {(form.japanese || form.reading || form.english) && (
        <div className="mb-6 bg-white border border-gold/20 rounded-2xl p-5 shadow-card
                        flex flex-col items-center text-center gap-2 animate-fade-in">
          <span className="font-jp text-4xl text-navy">{form.japanese || '—'}</span>
          {form.reading && (
            <span className="font-jp text-base text-muted">{form.reading}</span>
          )}
          {form.english && (
            <span className="text-sm text-ink/70 mt-1 border-t border-gold/10 pt-2 w-full">
              {form.english}
            </span>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={e => handleSubmit(e, false)} className="space-y-5">
        <div className="bg-white border border-gold/20 rounded-2xl p-6 shadow-card space-y-5">
          {field('japanese')}
          {field('reading')}
          {field('english')}
        </div>

        {error && (
          <p className="text-vermilion text-sm bg-vermilion/5 border border-vermilion/20
                        rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        {saved && (
          <p className="text-green-700 text-sm bg-green-50 border border-green-200
                        rounded-lg px-4 py-2 animate-fade-in">
            ✓ Word saved!
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={e => handleSubmit(e, true)}
            disabled={saving}
            className="flex-1 border border-gold/30 text-navy hover:bg-gold/10 px-4 py-3
                       rounded-xl font-medium text-sm transition-colors disabled:opacity-50"
          >
            Save & add another
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-navy hover:bg-navy/80 text-paper px-4 py-3
                       rounded-xl font-medium text-sm transition-colors
                       shadow-card hover:shadow-card-hover disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save word →'}
          </button>
        </div>
      </form>

      {/* Tip */}
      <p className="mt-6 text-xs text-muted/60 text-center">
        Reading (furigana) is optional but recommended for kanji words.
      </p>
    </div>
  )
}
