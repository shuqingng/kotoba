'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReadingAddPage() {
  const router = useRouter()
  const [form,   setForm]   = useState({ japanese: '', reading: '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [saved,  setSaved]  = useState(false)

  const handleSubmit = async (e: React.FormEvent, addAnother = false) => {
    e.preventDefault()
    if (!form.japanese.trim() || !form.reading.trim()) {
      setError('Both fields are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/reading', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      if (!res.ok) throw new Error(await res.text())

      if (addAnother) {
        setForm({ japanese: '', reading: '' })
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } else {
        router.push('/reading')
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-lg mx-auto">

      {/* Heading */}
      <div className="mb-8">
        <h1 className="font-jp text-4xl text-navy font-medium">読み追加</h1>
        <p className="text-muted text-sm mt-1">Add a new reading card</p>
      </div>

      {/* Preview card */}
      {(form.japanese || form.reading) && (
        <div className="mb-6 bg-white border border-gold/20 rounded-2xl p-5 shadow-card
                        flex flex-col items-center text-center gap-2 animate-fade-in">
          <span className="font-jp text-4xl text-navy">{form.japanese || '—'}</span>
          {form.reading && (
            <span className="font-jp text-lg text-vermilion">{form.reading}</span>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={e => handleSubmit(e, false)} className="space-y-5">
        <div className="bg-white border border-gold/20 rounded-2xl p-6 shadow-card space-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest text-muted">
              Japanese word / kanji
            </label>
            <input
              type="text"
              value={form.japanese}
              placeholder="例：東京"
              onChange={e => setForm(f => ({ ...f, japanese: e.target.value }))}
              className="font-jp text-2xl text-navy border border-gold/25 rounded-xl px-4 py-3
                         bg-white focus:outline-none focus:border-gold focus:ring-2
                         focus:ring-gold/20 placeholder:text-muted/40 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-widest text-muted">
              Reading (furigana)
            </label>
            <input
              type="text"
              value={form.reading}
              placeholder="とうきょう"
              onChange={e => setForm(f => ({ ...f, reading: e.target.value }))}
              className="text-base border border-gold/25 rounded-xl px-4 py-3 bg-white
                         focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20
                         placeholder:text-muted/40 transition"
            />
          </div>
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
            ✓ Card saved!
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
            {saving ? 'Saving…' : 'Save card →'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-xs text-muted/60 text-center">
        The reading will be hidden during review — you recall it from the kanji alone.
      </p>
    </div>
  )
}
