# T04 — Confirm the news engine supports a Research category

Type: wayfinder:research (AFK)
Status: closed (2026-07-12)
Assignee: Claude (Wave 1 overnight session, 2026-07-12)
Blocked-by:

## Question

The spec (§4) reuses the news/posts engine for Research posts and says "confirm the news schema has a category/tag or add one small field". Inspect `lib/events.ts`, the news table migration, admin `NewsForm.tsx`, and the news list/detail pages: does a category/tag field exist? If not, specify the minimal addition (column, admin form field, list-page filter) as a short markdown asset linked here.

## Resolution (2026-07-12)

**No category/tag field exists** anywhere in the news path — not in the `news_posts` table
(canonical schema in `docs/frisbee-mv-technical-spec-v1.0.md:617-627`; no migration files exist
in this repo), not in `lib/events.ts`'s `NewsPost` type, not in the admin API routes or
`NewsForm.tsx`. The news list page (`app/(site)/news/NewsFilter.tsx`) fakes three categories by
regex-matching post titles client-side — this pseudo-category must be replaced, not extended.

Minimal addition specified in [`wayfinder/assets/T04-news-schema.md`](../assets/T04-news-schema.md):
one CHECK-constrained `category text NOT NULL DEFAULT 'news'` column (values `news`/`research`,
added manually in the Supabase SQL editor — no migration tooling exists) threaded through six
touchpoints (type, 3 read queries, API insert/update, admin form select), plus real-category
filtering in `NewsFilter.tsx` and a `Badge` variant on the detail page. Implementation belongs
to the Wave-4 data-section build (with T05/T06), not Wave 1.
