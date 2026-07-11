# T04 asset — News schema: category/tag support

Researched 2026-07-12 (Wave 1 overnight session). Question from the spec (§4): does the
news/posts engine have a category/tag field the Research posts can reuse, or does one need adding?

## Finding: no category field exists anywhere in the news path

- **Schema.** There are no migration files in this repo (no `migrations/`, `supabase/`, `db/`
  directories). The canonical `news_posts` schema lives in
  `docs/frisbee-mv-technical-spec-v1.0.md:617-627`:

  ```sql
  CREATE TABLE news_posts (
    post_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug         text NOT NULL UNIQUE,
    title        text NOT NULL,
    summary      text NOT NULL,
    body         text NOT NULL,
    author       text NOT NULL DEFAULT 'UFA',
    published_at timestamptz,
    cover_image_url text,
    created_at   timestamptz DEFAULT now()
  );
  ```

  Columns: `post_id, slug, title, summary, body, author, published_at, cover_image_url,
  created_at`. **No `category`, `tag`, or `type` column.** The `NewsPost` interface at
  `lib/events.ts:21-31` mirrors it exactly.

- **A cosmetic pseudo-category exists — and is a trap.** `app/(site)/news/NewsFilter.tsx:15-34`
  hardcodes three tabs (`Announcements | Tournament Results | Federation Updates`) and
  **infers** the category by regex-matching the post title (`inferCategory(title)`), entirely
  client-side. It is not data-backed; a Research post would be mis-bucketed by whatever its
  title happens to match.

- **Closest real pattern.** The `events` table has a genuine enum column
  `event_type: 'tournament' | 'social' | 'clinic' | 'agm' | 'other'` (`lib/events.ts:9`) — the
  model to copy.

## Minimal-addition spec (for the Wave-4 data-section build; NOT implemented in Wave 1)

One nullable text column with a checked default, threaded through six touchpoints:

1. **DB (manual, Supabase SQL editor — no migration tooling exists):**
   `ALTER TABLE news_posts ADD COLUMN category text NOT NULL DEFAULT 'news' CHECK (category IN ('news', 'research'));`
   Also update the schema block in `docs/frisbee-mv-technical-spec-v1.0.md:617-627`.
2. **Type:** add `category: 'news' | 'research'` to `NewsPost` (`lib/events.ts:21-31`).
3. **Read queries:** add `category` to the SELECT lists in `getPublishedPosts`
   (`lib/events.ts:124-143`), `getPostBySlug` (`:145-163`), `getRecentPosts` (`:165-188`).
   `getPublishedPosts` gains an optional `category` filter arg for the Research index page.
4. **API insert:** `app/api/admin/news/route.ts` — destructure (`:12`), INSERT columns/VALUES
   (`:32-41`), RETURNING (`:42-44`).
5. **API update:** `app/api/admin/news/[postId]/route.ts` — add `'category'` to the `allowed`
   allowlist (`:30`) and the SELECT/RETURNING lists (`:8-15`, `:46-48`).
6. **Admin form:** `app/admin/news/NewsForm.tsx` — a two-option `<select>` (news/research) near
   the Author field (`:147-168`), state (`:31-32`), payload (`:55-62`).

UI consumption (part of the same wave): replace `inferCategory` in
`app/(site)/news/NewsFilter.tsx` with the real `post.category`; render a category pill on the
detail page (`app/(site)/news/[slug]/page.tsx:120-128`) by extending `Badge`
(`app/_components/Badge.tsx:3-10` variant union + `:25-33` class map — keep WCAG AA pairs).

Two values only (`news`/`research`) until a third is actually needed; free-text tags are
explicitly out — the spec needs exactly one distinction, Research vs everything else.

## Resolution

Closed 2026-07-12. No category field exists; the minimal addition is one CHECK-constrained
`category` column + the six touchpoints above. Implementation belongs to the Wave-4 data-section
build (T05/T06), not Wave 1. The `NewsFilter.tsx` title-regex pseudo-category must be replaced,
not extended — it silently mis-buckets.
