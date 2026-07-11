import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/auth'

type Params = { params: Promise<{ overrideId: string }> }

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { overrideId } = await params
  try {
    await sql`DELETE FROM session_overrides WHERE override_id = ${overrideId}::uuid`
    return NextResponse.json({ deleted: overrideId })
  } catch (err) {
    console.error('DELETE /api/admin/overrides/[overrideId] error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
