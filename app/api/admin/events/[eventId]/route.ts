import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

type Params = { params: Promise<{ eventId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { eventId } = await params
  const rows = await sql`
    SELECT
      event_id::text, slug, title, event_type, start_date::text, end_date::text,
      location, city, description, photos_url, cover_image_url, is_published, created_at::text
    FROM events
    WHERE event_id = ${eventId}::uuid
    LIMIT 1
  `
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { eventId } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowed = [
    'slug', 'title', 'event_type', 'start_date', 'end_date',
    'location', 'city', 'description', 'photos_url', 'cover_image_url', 'is_published',
  ]
  const fields = Object.keys(body).filter((k) => allowed.includes(k))
  if (fields.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    // Build dynamic SET clause
    const setClauses = fields.map((field) => {
      const val = body[field] === '' ? null : body[field]
      return sql`${sql(field)} = ${val as string | boolean | null}`
    })

    const rows = await sql`
      UPDATE events
      SET ${setClauses.reduce((acc, clause) => sql`${acc}, ${clause}`)}
      WHERE event_id = ${eventId}::uuid
      RETURNING
        event_id::text, slug, title, event_type, start_date::text, end_date::text,
        location, city, description, photos_url, cover_image_url, is_published, created_at::text
    `
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('PATCH /api/admin/events/[eventId] error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { eventId } = await params
  try {
    await sql`DELETE FROM events WHERE event_id = ${eventId}::uuid`
    return NextResponse.json({ deleted: eventId })
  } catch (err) {
    console.error('DELETE /api/admin/events/[eventId] error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
