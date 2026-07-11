# Plan 002: Centralize league data access into lib/league-queries.ts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a19e878..HEAD -- app/league lib/league-standings.ts lib/league-cache.ts`
> Plan 001 is EXPECTED to have modified these files (invalidation calls, key
> renames, `revalidate: 300`). Any other drift → compare excerpts before
> proceeding; on a mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/001-league-cache-invalidation-and-key-collisions.md
- **Category**: tech-debt
- **Planned at**: commit `a19e878`, 2026-07-12

## Why this matters

Roughly 40 `unstable_cache`-wrapped query functions are defined inline inside
11 league page files. `getActiveSeason` is copy-pasted in 7 pages (with SQL
drift already visible), `getCachedStandings = unstable_cache(getStandings, ...)`
is re-declared in 4. Hand-typed cache-key strings scattered across pages are
exactly how the collisions fixed in Plan 001 happened, and they will happen
again unless keys and queries live in one module. Centralizing also gives one
place to set tags/TTL and keeps pages as thin composition layers, which is the
pattern the site half of the repo already follows (`lib/events.ts`).

## Current state

- `lib/league-standings.ts` — the ONLY extracted league query module today;
  exports `getStandings(seasonId)` and `getHistoricalStandings(seasonId)`
  (plain async functions, no caching). This is the exemplar: typed row
  interfaces + explicit `rows.map` normalization. Match it.
- `lib/league-db.ts` — the postgres client used by all league queries
  (`import sql from '@/lib/league-db'`).
- `lib/league-cache.ts` — created by Plan 001; exports `invalidateLeagueCache()`.
- Inline cached loaders (all shaped like the excerpt below), per file (line
  numbers pre-001, use as anchors):
  - `app/league/page.tsx` — `getActiveSeason`(:10), `getNextFixtures`(:24), `getLastResult`(:50), `getCachedStandings`(:77)
  - `app/league/standings/page.tsx` — `getActiveSeason`(:11), `getCachedStandings`(:25), `getCachedHistoricalStandings`(:31), `getFormGuide`(:38)
  - `app/league/fixtures/page.tsx` — `getActiveSeason`(:52), `getAllFixtures`(:66), `getTeamNames`(:90), `getHolidays`(:103)
  - `app/league/teams/page.tsx` — `getActiveSeason`(:9), `getTeamsWithStats`(:23)
  - `app/league/players/page.tsx` — `getAllPlayers`(:9)
  - `app/league/spirit/page.tsx` — `getActiveSeason`(:8), `getSpiritLeaderboard`(:17)
  - `app/league/stats/page.tsx` — `getActiveSeason`(:8), `getGoals`(:52), `getAssists`(:87), `getBlocks`(:122), `getAppearances`(:157), `getMatchweekHistory`(:190)
  - `app/league/mvp/page.tsx` — `getActiveSeason`(:8), `getMvpScores`(:48), `getMvpHistory`(:94)
  - `app/league/match/[matchId]/page.tsx` — `getMatch`(:13), `getPlayerStats`(:44), `getAbsences`(:65), `getSpiritNominations`(:83), `getTeamRoster`(:102)
  - `app/league/team/[teamId]/page.tsx` — `getTeam`(:13), `getRoster`(:27), `getUpcomingFixtures`(:49), `getTeamRecord`(:75), `getHeadToHead`(:122), `getRecentFixtures`(:173), `getCachedStandings`(:201)
  - `app/league/player/[playerId]/page.tsx` — `getPlayer`(:13), `getSpiritNominationsReceived`(:33), `getSeasonTotals`(:46), `getMatchLog`(:63), `getCachedStandings`(:111)

Example of the inline pattern being moved (from `app/league/standings/page.tsx:11-23`):

```ts
const getActiveSeason = unstable_cache(
  async () => {
    const rows = await sql`
      SELECT season_id::text, season_name
      FROM seasons
      WHERE status = 'active'
      LIMIT 1
    `
    return rows[0] ?? null
  },
  ['league-active-season'],
  { tags: ['league'], revalidate: 300 }  // revalidate added by Plan 001
)
```

Known intentional shape variants of `getActiveSeason` (after Plan 001 they have
distinct keys): home page also selects `status`; spirit returns just the id
string; teams selects only `season_id`. In the central module, collapse all
four variants into ONE canonical
`getActiveSeason(): Promise<{ season_id: string; season_name: string; status: string } | null>`
and adapt callers (spirit uses `.season_id`, etc.). One superset query replaces
four near-duplicates — the extra two columns are free.

Repo conventions: league files use no semicolons, single quotes, `@/lib/...`
imports for lib modules. `lib/league-standings.ts` is the structural exemplar.

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Install   | `npm install`      | exit 0              |
| Typecheck | `npx tsc --noEmit` | exit 0              |
| Build     | `npm run build`    | exit 0              |

## Scope

**In scope**:
- `lib/league-queries.ts` (create)
- The 11 league page files listed above (imports + deleting inline loaders)
- `lib/league-standings.ts` (optional: re-export through league-queries; do not
  change its SQL)

**Out of scope**:
- Any SQL logic change (byte-identical queries move as-is, except the
  4-way `getActiveSeason` merge described above)
- `app/api/league/**` handlers
- Admin league pages (`app/league/admin/**`) — they query live (uncached) and
  stay that way
- `lib/league-fixtureUtils.tsx`, `lib/league-schedule.ts`, `lib/league-utils.ts`
- Anything under `app/(site)`, `app/pickup`, `app/admin`

## Git workflow

- Branch: `advisor/002-league-queries`
- One commit per page migrated is ideal; short imperative messages.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Create `lib/league-queries.ts` skeleton

Header: `import { unstable_cache } from 'next/cache'`, `import sql from './league-db'`,
`import { getStandings, getHistoricalStandings } from './league-standings'`.
Define a single constant `const LEAGUE_CACHE = { tags: ['league'], revalidate: 300 } as const`
and a `key` helper: `const key = (k: string) => ['league-' + k]`. Every export
in this module is `unstable_cache(fn, key('...'), LEAGUE_CACHE)`. Export the
canonical `getActiveSeason` (superset shape above, key `key('active-season-v2')`
— use a NEW key so no stale pre-migration entry with a different shape can be
served) and `getCachedStandings = unstable_cache(getStandings, key('standings'), LEAGUE_CACHE)`,
`getCachedHistoricalStandings` likewise.

**Verify**: `npx tsc --noEmit` → exit 0

### Step 2: Migrate shared loaders (the duplicated ones)

Replace inline `getActiveSeason` / `getCachedStandings` /
`getCachedHistoricalStandings` in all pages with imports from
`@/lib/league-queries`. Adapt the three variant call sites:
- `spirit/page.tsx`: `const season = await getActiveSeason()`; use
  `season?.season_id ?? null` where it previously used the string.
- `teams/page.tsx` and `page.tsx`: field access unchanged (superset shape).
Delete the now-unused inline definitions and their `unstable_cache`/`sql`
imports where no other loader in the file needs them.

**Verify**: `grep -rn "const getActiveSeason" app/league` → 0 matches;
`grep -rn "unstable_cache(getStandings" app/league` → 0 matches;
`npx tsc --noEmit` → exit 0

### Step 3: Migrate the per-page loaders, one page per commit

For each of the 11 pages, move its remaining inline loaders into
`lib/league-queries.ts` verbatim (SQL unchanged), named exports, keys via the
`key()` helper preserving the existing key string (e.g. `key('form-guide')`,
`key('team-roster')`, `key('team-roster-with-stats')` from Plan 001). Update
the page to import them. After each page: `npx tsc --noEmit` → exit 0.

**Verify (after all pages)**:
`grep -rn "unstable_cache" app/league --include=*.tsx | wc -l` → 0;
`grep -rn "from '@/lib/league-db'" app/league --include=*.tsx` → only
`app/league/admin/**` files remain (public pages no longer own SQL).

### Step 4: Full build

**Verify**: `npm run build` → exit 0

## Test plan

No test framework exists. Gates: the greps above + typecheck + build. Manual
smoke if a dev DB is configured: `/league`, `/league/standings`,
`/league/spirit`, one team page, one match page — all render with data.
Confirm no page defines SQL: reviewing `git diff --stat` should show every
public league page shrinking.

## Done criteria

- [ ] `npx tsc --noEmit` exits 0
- [ ] `npm run build` exits 0
- [ ] `grep -rln "unstable_cache" app/league --include=*.tsx | wc -l` = 0
- [ ] `lib/league-queries.ts` exists; every export uses the shared
      `LEAGUE_CACHE` constant (`grep -c "LEAGUE_CACHE" lib/league-queries.ts` ≥ 30)
- [ ] No files outside the in-scope list modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- Plan 001 is not yet applied (no `lib/league-cache.ts`, or tagged calls lack
  `revalidate`) → STOP; execute 001 first.
- Two inline loaders with the same name turn out to have *different SQL* beyond
  the documented `getActiveSeason`/roster variants → STOP and report the diff
  rather than guessing which wins.
- A page uses a loader's row shape in a way the canonical superset breaks →
  report, don't widen the type with `any`.

## Maintenance notes

- All future league queries go in `lib/league-queries.ts` (cached, tagged) or
  `lib/league-standings.ts`-style pure modules wrapped there. Pages never
  import `lib/league-db` directly.
- Reviewer: check every moved query is byte-identical (except the documented
  merge) and every key string survived — a changed key silently orphans a cache
  entry (harmless) but a *reused* key with new shape is the Plan-001 bug again.
- Deferred: performance pass on `getTeamRecord` (scans all seasons — no
  `season_id` filter, `app/league/team/[teamId]/page.tsx:75`) and the triple
  `fixtures⋈match_results` scan on the standings page. Do that in a separate
  change with EXPLAIN evidence; centralization makes it a one-file edit.
