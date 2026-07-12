import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { newsCategoryColumnExists } from '@/lib/events'

type Params = { params: Promise<{ postId: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = await params
  const rows = await sql`
    SELECT
      post_id::text, slug, title, summary, body, author,
      published_at::text, cover_image_url,
      COALESCE(to_jsonb(news_posts) ->> 'category', 'news') AS category,
      created_at::text
    FROM news_posts
    WHERE post_id = ${postId}::uuid
    LIMIT 1
  `
  if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rows[0])
}

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = await params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowed = ['slug', 'title', 'summary', 'body', 'author', 'cover_image_url', 'published_at', 'category']
  let fields = Object.keys(body).filter((k) => allowed.includes(k))

  if (fields.includes('category')) {
    if (body.category !== 'news' && body.category !== 'research') {
      return NextResponse.json({ error: "category must be 'news' or 'research'" }, { status: 400 })
    }
    // Default-safe: pre-migration the column doesn't exist — drop it from the update.
    if (!(await newsCategoryColumnExists())) {
      fields = fields.filter((f) => f !== 'category')
    }
  }

  if (fields.length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  try {
    const setClauses = fields.map((field) => {
      const val = body[field] === '' ? null : body[field]
      return sql`${sql(field)} = ${val as string | null}`
    })

    const rows = await sql`
      UPDATE news_posts
      SET ${setClauses.reduce((acc, clause) => sql`${acc}, ${clause}`)}
      WHERE post_id = ${postId}::uuid
      RETURNING
        post_id::text, slug, title, summary, body, author,
        published_at::text, cover_image_url,
        COALESCE(to_jsonb(news_posts) ->> 'category', 'news') AS category,
        created_at::text
    `
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(rows[0])
  } catch (err: unknown) {
    const pg = err as { code?: string }
    if (pg.code === '23505') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }
    console.error('PATCH /api/admin/news/[postId] error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { postId } = await params
  try {
    await sql`DELETE FROM news_posts WHERE post_id = ${postId}::uuid`
    return NextResponse.json({ deleted: postId })
  } catch (err) {
    console.error('DELETE /api/admin/news/[postId] error:', err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
