import { NextResponse } from 'next/server'
import { deleteReadingCard } from '@/lib/reading-sheets'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteReadingCard(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/reading/:id]', err)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
