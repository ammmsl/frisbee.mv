# Plan 007: Rewrite CLAUDE.md to describe the merged monorepo truthfully

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat a19e878..HEAD -- CLAUDE.md lib/session.ts`
> Also check `plans/README.md` status: this plan documents the caching model
> as it exists AFTER Plans 001/002 — if those are not DONE, either wait or
> document the pre-001 model accurately (state which you did in your report).

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/001..., plans/002... (documents their end state; soft
  dependency — see drift check)
- **Category**: docs / dx
- **Planned at**: commit `a19e878`, 2026-07-12

## Why this matters

`CLAUDE.md` is the file every agent session is told to read first, and it is
now actively wrong in ways that misdirect work: it claims the league tracker
lives in a separate repo and forbids importing it (it was merged into this repo
long ago), its route diagram omits `app/league/**` and `app/pickup/**` and
places the home page at the wrong path, it names the wrong accent colour, and
its env-var list omits half the variables the code reads. For an agent-driven
repo, stale orientation is worse than none — each error propagates into every
future session. `lib/session.ts` has a matching comment/code contradiction.

## Current state

Every discrepancy, verified at `a19e878`:

1. **Separate-repo claim** — CLAUDE.md "What This Project Is": "It is not
   connected to the League Tracker codebase. The League Tracker is a separate
   project on a separate repo" and "What This Project Does NOT Include":
   "League tracker routes — separate project, separate repo … Do not reference
   or import from the league tracker codebase." Reality: `app/league/` (25+
   files), `app/api/league/admin/**` (11 route files), `lib/league-db.ts`,
   `lib/league-auth.ts`, `lib/league-standings.ts`, `lib/league-schedule.ts`,
   `lib/league-utils.ts`, `lib/league-fixtureUtils.tsx` are all in this repo.
2. **Route diagram** — shows `app/page.tsx` as home; actual home is
   `app/(site)/page.tsx` (creating `app/page.tsx` would conflict — this exact
   mistake is called out in the project memory). Diagram lists `api/sheets/`
   which does not exist; omits `app/league/**`, `app/api/league/**`,
   `app/pickup/membership/`, `app/dev-preview` (deleted by Plan 006).
3. **Design system** — CLAUDE.md says accent `#FF6B35` (disc-orange);
   `app/globals.css:15` defines `--color-accent: #469BAF` (pacific-blue) and
   `:102` `--accent: #469BAF`; `lib/tokens.ts` documents the full palette
   (hover `#3a8899`, dark `#2f6e7a`, light `#92C2CF`).
4. **Env vars** — CLAUDE.md lists only Phase-1/2 site vars. Missing:
   `LEAGUE_DATABASE_URL`, `LEAGUE_JWT_SECRET`, `LEAGUE_ADMIN_PASSWORD_HASH`,
   and after Plan 004: `SHEETS_API_KEY`, `SHEET_ID`,
   `PICKUP_ADMIN_PASSWORD_HASH`. (If Plan 005 landed, just point at
   `.env.example` as the source of truth.)
5. **Hard rule 3** — "All writes via `/api/admin/*`" is incomplete: league
   writes go via `/api/league/admin/*` (protected by the same `proxy.ts`, but
   a different cookie/secret realm).
6. **Hard rule 5** — "`revalidate = 0` on all dynamic public pages (home,
   calendar, events, news, league pages)" is wrong for league pages: they use
   `export const dynamic = 'force-dynamic'` + `unstable_cache(..., { tags:
   ['league'], revalidate: 300 })`, invalidated by `invalidateLeagueCache()`
   from every league admin write (the Plans 001/002 model). This was a
   deliberate reaction to build timeouts (git: "Patch fix for Build Timeouts",
   "Option A: Remove Revalidate call from League standings page") and must be
   documented as the blessed league caching model, not "fixed" back.
7. **`lib/session.ts` comment drift** — header comment (line ~4) and the
   `getNextSession` doc block say sessions run "at 17:30 MVT", but
   `lib/session.ts:30` has `SESSION_HOUR = 20` and `:139` renders
   `time: '8:00 PM'`. Meanwhile `lib/calendar.ts:107` hardcodes `'5:30 PM'`
   for calendar sessions. These contradict each other; the operator must
   confirm the real session time (see STOP conditions).

## Commands you will need

| Purpose   | Command            | Expected on success |
|-----------|--------------------|---------------------|
| Typecheck | `npx tsc --noEmit` | exit 0              |

## Scope

**In scope**:
- `CLAUDE.md` (rewrite the stale sections; keep accurate ones)
- `lib/session.ts` (comments ONLY — do not change `SESSION_HOUR` or any code)

**Out of scope**:
- `docs/*.md` specs (historical planning documents — leave as-is)
- Memory files, `.claude/` config
- Any code behavior change

## Git workflow

- Branch: `advisor/007-claude-md-rewrite`
- Single commit. Do NOT push.

## Steps

### Step 1: Rewrite CLAUDE.md sections

Update, preserving the file's existing structure and tone:

- **What This Project Is**: state the repo now hosts three route areas — the
  federation site (`app/(site)`), the merged league tracker (`app/league` +
  `app/api/league`), and pickup tools (`app/pickup`). Remove the
  separate-repo/never-import language; replace with the real boundary rule:
  the league area keeps its own db client (`lib/league-db.ts`), auth realm
  (`lib/league-auth.ts`, cookie `ufa_admin_session`), and components
  (`app/league/_components`) — cross-imports between `(site)` and `league`
  should stay limited to `app/_components` and `lib/tokens.ts`.
- **Route structure diagram**: regenerate from the actual `app/` tree (run
  `find app -maxdepth 2 -type d` and transcribe; home page is
  `app/(site)/page.tsx` — include an explicit "never create `app/page.tsx`"
  warning).
- **Hard rule 3**: "All site CMS writes via `/api/admin/*`; all league writes
  via `/api/league/admin/*`; both protected by `proxy.ts` (two separate
  cookie/secret realms) AND handler-level `getAdminSession()` guards."
- **Hard rule 5**: split caching rules — `(site)` dynamic pages:
  `revalidate = 0`; league public pages: `force-dynamic` +
  `unstable_cache` tagged `'league'` with `revalidate: 300`, all cached
  loaders in `lib/league-queries.ts`, every league admin write calls
  `invalidateLeagueCache()`. Add: "never add `generateStaticParams` to
  DB-backed pages (build-timeout regression)."
- **Design System table**: accent `#469BAF` (pacific-blue), hover `#3a8899`,
  dark `#2f6e7a`, light `#92C2CF`; note `lib/tokens.ts` as the JS mirror of
  `globals.css`.
- **Environment Variables**: replace the list with the full current set (or,
  if `.env.example` exists, a pointer to it plus the realm split:
  site vs league vs pickup vs Google).
- **What This Project Does NOT Include**: remove "league tracker routes" and
  "shared navigation"; keep what remains true (e.g. Pick'em, if still absent —
  verify with `grep -rin "pickem\|pick'em" app` → expect 0).
- Update the "Last updated" line to the current date.

**Verify**: `grep -n "FF6B35\|separate repo\|separate project on a separate repo\|api/sheets" CLAUDE.md`
→ 0 matches; `grep -c "league" CLAUDE.md` ≥ 10 (league area is now documented).

### Step 2: Fix `lib/session.ts` comments

Change the header comment and `getNextSession` doc-block references from
"17:30 MVT" to "20:00 MVT (8:00 PM)" so comments match `SESSION_HOUR = 20`.
Add one line noting the known inconsistency with `lib/calendar.ts`'s hardcoded
`'5:30 PM'` label if the operator has not resolved it (see STOP conditions).

**Verify**: `grep -n "17:30" lib/session.ts` → 0 matches;
`npx tsc --noEmit` → exit 0.

## Test plan

Docs-only change: gates are the greps above plus a human read-through. Ask the
operator (in your report) to skim the rewritten CLAUDE.md for factual errors —
it is the highest-trust file in the repo.

## Done criteria

- [ ] The five documented discrepancies (repo claim, route diagram, accent,
      env list, hard rules 3/5) are gone from CLAUDE.md
- [ ] `grep -n "17:30" lib/session.ts` → 0
- [ ] `npx tsc --noEmit` exits 0 (session.ts untouched except comments)
- [ ] No files outside CLAUDE.md and lib/session.ts modified (`git status`)
- [ ] `plans/README.md` status row updated

## STOP conditions

- You cannot determine the true session time (calendar says 5:30 PM,
  session.ts code says 8:00 PM/20:00): do NOT guess which is right. Fix only
  the session.ts comment to match its own code (20:00), flag the
  calendar-vs-session contradiction in your report for the operator to settle.
- Plans 001/002 are neither DONE nor obviously reflected in the code (no
  `lib/league-queries.ts`, no `invalidateLeagueCache`): document the caching
  model that actually exists in the code you can see, and say so in the report.

## Maintenance notes

- CLAUDE.md must be updated in the same PR as any architecture-shaping change
  (new route area, caching model change, new env var). Reviewers should treat
  a stale CLAUDE.md as a blocking review comment.
- The user-level memory file (auto-memory) also carries the stale
  "league tracker is a separate repo" claim — the operator may want to refresh
  it; that file is outside this repo and outside this plan.
