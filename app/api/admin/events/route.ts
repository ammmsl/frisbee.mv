import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

const VALID_EVENT_TYPES = ['tournament', 'social', 'clinic', 'agm', 'other'] as const

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { slug, title, event_type, start_date } = body as Record<string, unknown>

  if (
    typeof slug !== 'string' || !slug.trim() ||
    typeof title !== 'string' || !title.trim() ||
    typeof event_type !== 'string' || !(VALID_EVENT_TYPES as readonly string[]).includes(event_type) ||
    typeof start_date !== 'string' || !start_date.trim()
  ) {
    return NextResponse.json({ error: 'Missing or invalid required fields: slug, title, event_type, start_date' }, { status: 400 })
  }

  try {
    const rows = await sql`
      INSERT INTO events (
        slug, title, event_type, start_date, end_date, location, city,
        description, photos_url, cover_image_url, is_published
      ) VALUES (
        ${slug.trim()},
        ${(title as string).trim()},
        ${event_type},
        ${start_date.trim()},
        ${typeof body.end_date === 'string' && body.end_date ? body.end_date : null},
        ${typeof body.location === 'string' && body.location ? body.location : null},
        ${typeof body.city === 'string' && body.city ? body.city : 'Malé'},
        ${typeof body.description === 'string' && body.description ? body.description : null},
        ${typeof body.photos_url === 'string' && body.photos_url ? body.photos_url : null},
        ${typeof body.cover_image_url === 'string' && body.cover_image_url ? body.cover_image_url : null},
        ${typeof body.is_published === 'boolean' ? body.is_published : false}
      )
      RETURNING
        event_id::text, slug, title, event_type, start_date::text, end_date::text,
        location, city, description, photos_url, cover_image_url, is_published, created_at::text
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('POST /api/admin/events error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
