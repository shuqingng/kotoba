import { NextResponse } from 'next/server'
import { getAllReadingCards, addReadingCard } from '@/lib/reading-sheets'

export async function GET() {
  try {
    const cards = await getAllReadingCards()
    return NextResponse.json(cards)
  } catch (err) {
    console.error('[GET /api/reading]', err)
    return NextResponse.json({ error: 'Failed to fetch reading cards' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { japanese, reading } = body

    if (!japanese?.trim() || !reading?.trim()) {
      return NextResponse.json(
        { error: 'japanese and reading are required' },
        { status: 400 }
      )
    }

    const card = await addReadingCard({
      japanese: japanese.trim(),
      reading:  reading.trim(),
    })
    return NextResponse.json(card, { status: 201 })
  } catch (err) {
    console.error('[POST /api/reading]', err)
    return NextResponse.json({ error: 'Failed to add reading card' }, { status: 500 })
  }
}
