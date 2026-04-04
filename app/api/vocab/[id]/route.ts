import { NextResponse } from 'next/server'
import { updateVocab, deleteVocab } from '@/lib/sheets'

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteVocab(params.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/vocab/:id]', err)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body    = await req.json()
    const updated = await updateVocab(params.id, body)
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/vocab/:id]', err)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}
