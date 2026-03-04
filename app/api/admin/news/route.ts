import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { slug, title, summary, body: postBody } = body as Record<string, unknown>

  if (
    typeof slug !== 'string' || !slug.trim() ||
    typeof title !== 'string' || !title.trim() ||
    typeof summary !== 'string' || !summary.trim() ||
    typeof postBody !== 'string' || !postBody.trim()
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid required fields: slug, title, summary, body' },
      { status: 400 }
    )
  }

  const author = typeof body.author === 'string' && body.author ? body.author : 'MFDF'
  const cover = typeof body.cover_image_url === 'string' && body.cover_image_url ? body.cover_image_url : null
  const publishedAt = typeof body.published_at === 'string' && body.published_at ? body.published_at : null

  try {
    const rows = await sql`
      INSERT INTO news_posts (slug, title, summary, body, author, cover_image_url, published_at)
      VALUES (
        ${slug.trim()},
        ${(title as string).trim()},
        ${(summary as string).trim()},
        ${(postBody as string).trim()},
        ${author},
        ${cover},
        ${publishedAt}
      )
      RETURNING
        post_id::text, slug, title, summary, body, author, published_at::text,
        cover_image_url, created_at::text
    `
    return NextResponse.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('POST /api/admin/news error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
