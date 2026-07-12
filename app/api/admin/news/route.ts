import { NextRequest, NextResponse } from 'next/server'
import sql from '@/lib/db'
import { getAdminSession } from '@/lib/auth'
import { newsCategoryColumnExists } from '@/lib/events'

export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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

  const author = typeof body.author === 'string' && body.author ? body.author : 'UFA'
  const cover = typeof body.cover_image_url === 'string' && body.cover_image_url ? body.cover_image_url : null
  const publishedAt = typeof body.published_at === 'string' && body.published_at ? body.published_at : null

  if (body.category !== undefined && body.category !== 'news' && body.category !== 'research') {
    return NextResponse.json({ error: "category must be 'news' or 'research'" }, { status: 400 })
  }
  // 'news' is the column default, so only 'research' needs the column present.
  // Pre-migration a 'research' post silently saves as news — default-safe.
  const category =
    body.category === 'research' && (await newsCategoryColumnExists()) ? 'research' : null

  try {
    const record: Record<string, string | null> = {
      slug: slug.trim(),
      title: (title as string).trim(),
      summary: (summary as string).trim(),
      body: (postBody as string).trim(),
      author,
      cover_image_url: cover,
      published_at: publishedAt,
      ...(category ? { category } : {}),
    }
    const rows = await sql`
      INSERT INTO news_posts ${sql(record)}
      RETURNING
        post_id::text, slug, title, summary, body, author, published_at::text,
        cover_image_url,
        COALESCE(to_jsonb(news_posts) ->> 'category', 'news') AS category,
        created_at::text
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
