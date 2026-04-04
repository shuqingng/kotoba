import { NextResponse } from 'next/server'
import { getAllReadingCards, updateReadingCard } from '@/lib/reading-sheets'
import { applyReview, ReviewQuality } from '@/lib/sm2'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { quality } = await req.json() as { quality: ReviewQuality }

    if (!['again', 'hard', 'good', 'easy'].includes(quality)) {
      return NextResponse.json({ error: 'Invalid quality value' }, { status: 400 })
    }

    const all   = await getAllReadingCards()
    const entry = all.find(c => c.id === params.id)
    if (!entry) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 })
    }

    const sm2 = applyReview(quality, entry.interval, entry.ease_factor, entry.repetitions)
    await updateReadingCard(params.id, sm2)

    return NextResponse.json({ ...entry, ...sm2 })
  } catch (err) {
    console.error('[POST /api/reading/review/:id]', err)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
