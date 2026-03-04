import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

type Params = { params: Promise<{ overrideId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { overrideId } = await params
  try {
    await sql`DELETE FROM session_overrides WHERE override_id = ${overrideId}::uuid`
    return NextResponse.json({ deleted: overrideId })
  } catch (err) {
    console.error('DELETE /api/admin/overrides/[overrideId] error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
