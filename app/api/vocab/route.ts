import { NextResponse } from 'next/server'
import { getAllVocab, addVocab } from '@/lib/sheets'

export async function GET() {
  try {
    const vocab = await getAllVocab()
    return NextResponse.json(vocab)
  } catch (err) {
    console.error('[GET /api/vocab]', err)
    return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { japanese, reading, english } = body

    if (!japanese?.trim() || !english?.trim()) {
      return NextResponse.json(
        { error: 'japanese and english are required' },
        { status: 400 }
      )
    }

    const entry = await addVocab({
      japanese: japanese.trim(),
      reading:  (reading ?? '').trim(),
      english:  english.trim(),
    })
    return NextResponse.json(entry, { status: 201 })
  } catch (err) {
    console.error('[POST /api/vocab]', err)
    return NextResponse.json({ error: 'Failed to add vocabulary' }, { status: 500 })
  }
}
