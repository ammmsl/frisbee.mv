import sql from './db'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Event {
  event_id: string
  slug: string
  title: string
  event_type: 'tournament' | 'social' | 'clinic' | 'agm' | 'other'
  start_date: string      // 'YYYY-MM-DD'
  end_date: string | null
  location: string | null
  city: string
  description: string | null
  photos_url: string | null
  cover_image_url: string | null
  is_published: boolean
  created_at: string
}

export type NewsCategory = 'news' | 'research'

export interface NewsPost {
  post_id: string
  slug: string
  title: string
  summary: string
  body: string
  author: string
  published_at: string | null   // ISO string
  cover_image_url: string | null
  category: NewsCategory
  created_at: string
}

export interface SessionOverride {
  override_id: string
  session_date: string    // 'YYYY-MM-DD'
  status: 'cancelled' | 'special'
  note: string | null
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getPublishedEvents(): Promise<Event[]> {
  const rows = await sql`
    SELECT
      event_id::text,
      slug,
      title,
      event_type,
      start_date::text,
      end_date::text,
      location,
      city,
      description,
      photos_url,
      cover_image_url,
      is_published,
      created_at::text
    FROM events
    WHERE is_published = true
    ORDER BY start_date DESC
  `
  return rows as unknown as Event[]
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  const rows = await sql`
    SELECT
      event_id::text,
      slug,
      title,
      event_type,
      start_date::text,
      end_date::text,
      location,
      city,
      description,
      photos_url,
      cover_image_url,
      is_published,
      created_at::text
    FROM events
    WHERE slug = ${slug}
      AND is_published = true
    LIMIT 1
  `
  return (rows as unknown as Event[])[0] ?? null
}

export async function getRelatedEvents(
  eventId: string,
  eventType: string,
  limit: number
): Promise<Event[]> {
  // Fetch up to `limit` same-type events excluding current; if fewer found,
  // backfill with same-year events.
  const rows = await sql`
    SELECT
      event_id::text,
      slug,
      title,
      event_type,
      start_date::text,
      end_date::text,
      location,
      city,
      description,
      photos_url,
      cover_image_url,
      is_published,
      created_at::text
    FROM events
    WHERE is_published = true
      AND event_id::text <> ${eventId}
    ORDER BY
      CASE WHEN event_type = ${eventType} THEN 0 ELSE 1 END,
      start_date DESC
    LIMIT ${limit}
  `
  return rows as unknown as Event[]
}

// ─── News ─────────────────────────────────────────────────────────────────────

// The category column arrives via migrations/001-news-category.sql, which is run
// manually. Until then it doesn't exist, so reads use
// COALESCE(to_jsonb(news_posts) ->> 'category', 'news') — valid SQL with or
// without the column — and writes check the column first (see helper below).

let hasCategoryColumn = false
export async function newsCategoryColumnExists(): Promise<boolean> {
  if (!hasCategoryColumn) {
    const rows = await sql`
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'news_posts' AND column_name = 'category'
    `
    hasCategoryColumn = rows.length > 0
  }
  return hasCategoryColumn
}

export async function getPublishedPosts(
  limit?: number,
  category?: NewsCategory
): Promise<NewsPost[]> {
  const rows = await sql`
    SELECT
      post_id::text,
      slug,
      title,
      summary,
      body,
      author,
      published_at::text,
      cover_image_url,
      COALESCE(to_jsonb(news_posts) ->> 'category', 'news') AS category,
      created_at::text
    FROM news_posts
    WHERE published_at IS NOT NULL
      AND published_at <= now()
      ${ category !== undefined ? sql`AND COALESCE(to_jsonb(news_posts) ->> 'category', 'news') = ${category}` : sql`` }
    ORDER BY published_at DESC
    ${ limit !== undefined ? sql`LIMIT ${limit}` : sql`` }
  `
  return rows as unknown as NewsPost[]
}

export async function getPostBySlug(slug: string): Promise<NewsPost | null> {
  const rows = await sql`
    SELECT
      post_id::text,
      slug,
      title,
      summary,
      body,
      author,
      published_at::text,
      cover_image_url,
      COALESCE(to_jsonb(news_posts) ->> 'category', 'news') AS category,
      created_at::text
    FROM news_posts
    WHERE slug = ${slug}
      AND published_at IS NOT NULL
    LIMIT 1
  `
  return (rows as unknown as NewsPost[])[0] ?? null
}

export async function getRecentPosts(
  excludePostId: string,
  limit: number
): Promise<NewsPost[]> {
  const rows = await sql`
    SELECT
      post_id::text,
      slug,
      title,
      summary,
      body,
      author,
      published_at::text,
      cover_image_url,
      COALESCE(to_jsonb(news_posts) ->> 'category', 'news') AS category,
      created_at::text
    FROM news_posts
    WHERE published_at IS NOT NULL
      AND published_at <= now()
      AND post_id::text <> ${excludePostId}
    ORDER BY published_at DESC
    LIMIT ${limit}
  `
  return rows as unknown as NewsPost[]
}

// ─── Session Overrides ────────────────────────────────────────────────────────

export async function getSessionOverrides(
  fromDate: string,
  toDate: string
): Promise<SessionOverride[]> {
  const rows = await sql`
    SELECT
      override_id::text,
      session_date::text,
      status,
      note
    FROM session_overrides
    WHERE session_date BETWEEN ${fromDate}::date AND ${toDate}::date
    ORDER BY session_date ASC
  `
  return rows as unknown as SessionOverride[]
}
