# Plan 001: Fix league cache invalidation gaps and cache-key collisions

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a19e878..HEAD -- app/api/league/admin app/league lib/league-standings.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `a19e878`, 2026-07-12

## Why this matters

Every public league page (`app/league/**`) wraps its DB queries in
`unstable_cache(..., { tags: ['league'] })` with **no `revalidate` TTL**, so a
cached entry lives until someone calls `revalidateTag('league')`. Only 4 of the
11 league admin mutation handlers do that. Completing a season, bulk-editing
fixtures, adding/removing holidays, editing/deleting a result, creating a team,
or wiping fixtures changes **nothing** on the public site until an unrelated
mutation happens to flush the tag. Separately, two pairs of differently-shaped
cached loaders share identical cache keys, so one page's cached value is served
to another page expecting a different shape (this is the likely cause of the
"unstable caching" symptoms in git history). This plan is the minimal
correctness fix; Plan 002 does the structural cleanup.

## Current state

Repo: Next.js 16.1.6 App Router, TypeScript, npm. No test framework exists —
verification is `npx tsc --noEmit`, grep checks, and `npm run build`.

### Fact 1 — mutation handlers missing invalidation

Handlers that DO invalidate (the pattern to copy):

- `app/api/league/admin/results/route.ts:142` — `revalidateTag('league', 'max')`
- `app/api/league/admin/fixtures/route.ts:58` (POST handler only)
- `app/api/league/admin/fixtures/[matchId]/route.ts:37,60`
- `app/api/league/admin/teams/[teamId]/route.ts:27`

Handlers that do NOT invalidate (all perform DB writes):

- `app/api/league/admin/results/[matchId]/route.ts` (result edit/delete)
- `app/api/league/admin/teams/route.ts` (team create — POST; GET needs no change)
- `app/api/league/admin/season/route.ts` (season edit)
- `app/api/league/admin/season/status/route.ts` (season activate/complete — the worst one: the whole league site keys off the active season)
- `app/api/league/admin/holidays/route.ts` (POST)
- `app/api/league/admin/holidays/[holidayId]/route.ts` (DELETE)
- `app/api/league/admin/fixtures/bulk/route.ts` (bulk PATCH)
- `app/api/league/admin/fixtures/route.ts` — the `DELETE` handler (starts near line 67, "Delete all fixtures for the current season") has no `revalidateTag`, unlike the POST above it.

### Fact 2 — cache-key collision A: `['league-team-roster']`

`app/league/match/[matchId]/page.tsx:102-114`:

```ts
const getTeamRoster = unstable_cache(
  async (teamId: string) => {
    const rows = await sql`
      SELECT player_id::text, display_name
      FROM players
      WHERE team_id = ${teamId} AND is_active = true
      ORDER BY display_name
    `
    return rows
  },
  ['league-team-roster'],
  { tags: ['league'] }
)
```

`app/league/team/[teamId]/page.tsx:27-47` defines a DIFFERENT query (adds
goals/assists/blocks/appearances aggregates) under the SAME key parts
`['league-team-roster']` with the same `(teamId: string)` argument. `unstable_cache`
derives the cache entry from key parts + serialized arguments, so these two
collide: whichever runs first poisons the other. The team page can render
rosters with `undefined` stats, or the match page can receive the aggregate
shape.

### Fact 3 — cache-key collision B: `['league-active-season']`

Seven league pages each define their own `getActiveSeason` under the same key
parts `['league-active-season']`, all with zero arguments, but with THREE
different return shapes:

- `app/league/page.tsx:10-22` — returns row `{ season_id, season_name, status }`
- `app/league/standings/page.tsx:11-23`, `app/league/fixtures/page.tsx:52-`,
  `app/league/mvp/page.tsx:8-`, `app/league/stats/page.tsx:8-` — returns row
  `{ season_id, season_name }`
- `app/league/teams/page.tsx:9-` — returns row `{ season_id }` only
- `app/league/spirit/page.tsx:8-13` — returns a **plain string**:
  `return (rows[0]?.season_id as string) ?? null`

Because key + args are identical, the first page rendered after a cache flush
determines the cached value's shape for all seven. If `/league/spirit` warms the
cache, `/league` reads a string and `season.season_name` is `undefined`.

### Fact 4 — no TTL backstop

Every league `unstable_cache` call passes `{ tags: ['league'] }` with no
`revalidate`, e.g. `app/league/standings/page.tsx:11-35`. A missed invalidation
is therefore permanent, not merely slow.

### Repo conventions to match

- No semicolons in `app/league/**` files; single quotes; 2-space indent.
- Error responses: `NextResponse.json({ error: '...' }, { status: NNN })`.
- Existing invalidation call style: `revalidateTag('league', 'max')` — Next 16
  accepts the second "profile" argument. Use the same form the codebase already
  uses for consistency.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `npm install`      | exit 0              |
| Typecheck | `npx tsc --noEmit` | exit 0, no output   |
| Build     | `npm run build`    | exit 0              |

(`npm run lint` is currently broken — `next lint` was removed in Next 16; do
not use it as a gate. Plan 006 fixes it.)

## Scope

**In scope** (the only files you should modify):
- `lib/league-cache.ts` (create — one helper)
- `app/api/league/admin/results/[matchId]/route.ts`
- `app/api/league/admin/teams/route.ts`
- `app/api/league/admin/season/route.ts`
- `app/api/league/admin/season/status/route.ts`
- `app/api/league/admin/holidays/route.ts`
- `app/api/league/admin/holidays/[holidayId]/route.ts`
- `app/api/league/admin/fixtures/bulk/route.ts`
- `app/api/league/admin/fixtures/route.ts` (DELETE handler only)
- `app/league/team/[teamId]/page.tsx` (cache key string only)
- `app/league/spirit/page.tsx` (cache key string only)
- `app/league/teams/page.tsx` (cache key string only)
- `app/league/page.tsx` (cache key string only)

**Out of scope** (do NOT touch):
- Moving the query functions themselves into `lib/` — that is Plan 002.
- The 4 handlers that already invalidate correctly.
- `proxy.ts`, auth, any `(site)` or pickup file.
- The SQL text of any query.

## Git workflow

- Branch: `advisor/001-league-cache-fix`
- Commit style: short imperative title (repo examples: "League Table Fix",
  "Score entry simplification and validation rules").
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create the shared invalidation helper

Create `lib/league-cache.ts`:

```ts
import { revalidateTag } from 'next/cache'

/** Flush every cached league query. Call after ANY league DB write. */
export function invalidateLeagueCache() {
  revalidateTag('league', 'max')
}
```

**Verify**: `npx tsc --noEmit` → exit 0

### Step 2: Call it from every missing mutation handler

In each of the 8 handler locations listed in "Fact 1 — handlers that do NOT
invalidate", add `import { invalidateLeagueCache } from '@/lib/league-cache'`
and call `invalidateLeagueCache()` immediately after the successful DB write,
before building the success `NextResponse`. Do not add it to GET handlers.
For `app/api/league/admin/fixtures/route.ts` only touch the DELETE handler.

**Verify**:
`grep -rl "invalidateLeagueCache" app/api/league/admin | sort` → lists all 8
route files above; `npx tsc --noEmit` → exit 0

### Step 3: Fix collision A (roster key)

In `app/league/team/[teamId]/page.tsx:45` change the key parts of `getRoster`
from `['league-team-roster']` to `['league-team-roster-with-stats']`. Leave the
match page's key unchanged.

**Verify**: `grep -rn "league-team-roster" app/league` → exactly two matches,
one `league-team-roster` (match page), one `league-team-roster-with-stats`
(team page).

### Step 4: Fix collision B (active-season key)

Give each divergent shape its own key:

- `app/league/spirit/page.tsx` → `['league-active-season-id-str']`
- `app/league/teams/page.tsx` → `['league-active-season-id-row']`
- `app/league/page.tsx` → `['league-active-season-with-status']`
- Leave `standings`, `fixtures`, `mvp`, `stats` on `['league-active-season']`
  (they share an identical `{ season_id, season_name }` shape, which is safe).

**Verify**: `grep -rn "league-active-season" app/league` → standings/fixtures/
mvp/stats use `league-active-season`; spirit, teams, and page.tsx each use
their new distinct key. `npx tsc --noEmit` → exit 0.

### Step 5: Add a TTL backstop to every league unstable_cache call

In every `unstable_cache(fn, [key], { tags: ['league'] })` call under
`app/league/**` change the options object to
`{ tags: ['league'], revalidate: 300 }` (5 minutes). Files affected: `page.tsx`,
`standings/page.tsx`, `fixtures/page.tsx`, `teams/page.tsx`, `players/page.tsx`,
`spirit/page.tsx`, `stats/page.tsx`, `mvp/page.tsx`, `match/[matchId]/page.tsx`,
`team/[teamId]/page.tsx`, `player/[playerId]/page.tsx`.

**Verify**:
`grep -rn "tags: \['league'\]" app/league | grep -vc "revalidate" ` → `0`
(every tagged call now also has a revalidate); `npx tsc --noEmit` → exit 0.

### Step 6: Full build

**Verify**: `npm run build` → exit 0. (DATABASE_URL is not required at build
time — all league pages are `force-dynamic`; if the build fails on a missing
env var, STOP and report.)

## Test plan

No test framework exists in this repo (nothing in `package.json`
devDependencies). Verification is:

- The grep gates in each step (machine-checkable).
- `npx tsc --noEmit` and `npm run build` exit 0.
- Manual smoke (only if a dev DB is configured in `.env.local`): `npm run dev`,
  visit `/league/spirit` then `/league` — the home page must still show the
  season name (collision B fixed).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -rl "invalidateLeagueCache" app/api/league/admin | wc -l` ≥ 8
- [ ] `grep -rn "tags: \['league'\]" app/league | grep -v revalidate | wc -l` = 0
- [ ] `grep -c "league-team-roster'" app/league/team/[teamId]/page.tsx` = 0
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any handler file's write logic doesn't match the description (e.g. a handler
  already calls `revalidateTag` that this plan claims doesn't).
- `revalidateTag('league', 'max')` fails typecheck on this Next version — if
  so, report; do not silently change the call signature repo-wide.
- `npm run build` fails for a reason unrelated to your edits (pre-existing
  breakage) — report the error verbatim.

## Maintenance notes

- Plan 002 moves all these loaders into `lib/league-queries.ts`; the keys you
  renamed here get consolidated there. Land 001 first — it is the bugfix.
- Review focus: every league admin write path must end with
  `invalidateLeagueCache()`. Any future league mutation route must call it.
- Deferred: making the TTL configurable; per-entity tags (finer-grained
  invalidation) — not worth it at this traffic level.
