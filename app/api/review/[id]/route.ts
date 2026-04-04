import { NextResponse } from 'next/server'
import { updateVocab, getAllVocab } from '@/lib/sheets'
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

    // Find the current entry
    const all   = await getAllVocab()
    const entry = all.find(v => v.id === params.id)
    if (!entry) {
      return NextResponse.json({ error: 'Vocab not found' }, { status: 404 })
    }

    // Apply SM-2
    const sm2 = applyReview(quality, entry.interval, entry.ease_factor, entry.repetitions)

    const updated = await updateVocab(params.id, sm2)
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[POST /api/review/:id]', err)
    return NextResponse.json({ error: 'Failed to save review' }, { status: 500 })
  }
}
