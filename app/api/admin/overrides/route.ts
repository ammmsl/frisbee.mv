import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

const VALID_STATUSES = ['cancelled', 'special'] as const

export async function GET() {
  const rows = await sql`
    SELECT
      override_id::text,
      session_date::text,
      status,
      note,
      created_at::text
    FROM session_overrides
    ORDER BY session_date DESC
  `
  return NextResponse.json(rows)
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { session_date, status } = body as Record<string, unknown>

  if (
    typeof session_date !== 'string' || !session_date.trim() ||
    typeof status !== 'string' || !(VALID_STATUSES as readonly string[]).includes(status)
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid required fields: session_date, status (cancelled | special)' },
      { status: 400 }
    )
  }

  const note = typeof body.note === 'string' && body.note ? body.note : null

  try {
    const rows = await sql`
      INSERT INTO session_overrides (session_date, status, note)
      VALUES (${session_date.trim()}, ${status}, ${note})
      RETURNING
        override_id::text, session_date::text, status, note, created_at::text
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg.code === '23505') {
      return NextResponse.json({ error: 'An override already exists for this date' }, { status: 409 })
    }
    console.error('POST /api/admin/overrides error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
