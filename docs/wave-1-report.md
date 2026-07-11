# Wave 1 Report — Correctness & Security

**Branch:** `wave-1-correctness` (left checked out, **not pushed**; `main` untouched)
**Run:** overnight session, 2026-07-12
**Verification:** `npx tsc --noEmit` and `npm run build` exited 0 after **every** package and again at the end. Every machine-checkable gate in plans 001/003/004 passed (details per package below). `npm run lint` skipped — known-broken on Next 16 (plan 006 fixes it).

## Commits (oldest first)

| Commit | Package |
|---|---|
| `c41a4f5` | Planning artifacts adopted (hallmark plan, plans/, wayfinder/) + .gitignore |
| `9c44c93` | **A** — T04 closed: news schema research |
| `e92b2aa` | **B** — plan 001: league cache invalidation + key collisions |
| `c0c3df0` | **C** — plan 003: /admin proxy bypass + handler-level auth |
| `8acfb23` | **D** — plan 004: pickup payments server-side |
| `84fd88a` | **E** — Hallmark Phase 1 + live home stats |
| `12a23f8` | **F** — spec §6 amendments A1–A18 + T03 wording calls |

Nothing was reverted. All six packages shipped.

## Package A — T04 research (no code)

**No category/tag field exists** in the news path — not in `news_posts` (schema lives only in the tech spec; there are no migration files in the repo), not in `lib/events.ts`, the API routes, or `NewsForm.tsx`. The news list page *fakes* three categories by regex-matching post titles client-side (`NewsFilter.tsx`) — flagged as a trap that must be replaced, not extended. Minimal-addition spec (one CHECK-constrained `category` column + six touchpoints) written to `wayfinder/assets/T04-news-schema.md`; ticket closed; map updated. Implementation belongs to Wave 4.

## Package B — plan 001 (league cache)

- `lib/league-cache.ts` created; `invalidateLeagueCache()` called after every league admin DB write.
- **Plan drift found (benign):** the plan listed 8 handlers missing invalidation, but `results/[matchId]/route.ts` and `teams/route.ts` are **GET-only — they contain no writes**. The 6 real write handlers were patched (season edit, season status, holidays POST/DELETE, fixtures bulk, fixtures wipe). The plan's "≥ 8 files" done-criterion is therefore 6 by construction; every write path is covered.
- Collision A fixed: team page roster key → `league-team-roster-with-stats`.
- Collision B fixed: `spirit` → `-id-str`, `teams` → `-id-row`, league home → `-with-status`; the four identical-shape pages keep `league-active-season`.
- `revalidate: 300` backstop on all 30 league `unstable_cache` calls (gate: 0 tagged calls without revalidate).

## Package C — plan 003 (admin hardening)

- `proxy.ts`: exact-path `/admin`, `/api/admin`, `/league/admin`, `/api/league/admin` now guarded (the `startsWith('/admin/')` hole served the dashboard shell to anonymous users).
- `lib/auth.ts` + `lib/league-auth.ts`: lazy `getSecret()` throws descriptively when unset — no more signing with the encoding of `undefined`.
- `lib/auth.ts` gained `getAdminSession()`; **all 17 non-login admin route files** now re-verify the session per handler (gate: only `login`/`logout` routes lack the guard; there is no league logout route).
- `app/admin/page.tsx` redirects to `/admin/login` without a session.
- League login: JSON try/catch + `LEAGUE_ADMIN_PASSWORD_HASH` guard. Frisbee login cookie `secure` flag aligned to production-only (works over http in dev).

## Package D — plan 004 (payments server-side)

- `app/api/pickup/sheets/route.ts` — server fetch of the four tabs, `unstable_cache` 300 s, 502 without leaking upstream errors; `fetchWithRetry` semantics preserved.
- `_lib/sheets.ts` is now a thin client of that route — `PaymentTracker` unchanged.
- `app/api/pickup/admin/verify/route.ts` — bcrypt vs `PICKUP_ADMIN_PASSWORD_HASH`, rate-limited 5/IP/hour.
- `AdminGate` stores the literal `'ok'` in localStorage, never the password.
- Gates: **zero** `NEXT_PUBLIC_SHEETS_API_KEY|SHEET_ID|ADMIN_PASSWORD` references remain in `app/` or `lib/`.
- Env: `SHEETS_API_KEY`, `SHEET_ID`, `PICKUP_ADMIN_PASSWORD_HASH` (bcrypt of the current password) appended to `.env.local` via a temp script that was deleted afterwards; no secret was printed or committed. **No credential was rotated** — per T01 risk-acceptance, as instructed.
- Later (E) the cached fetch moved to `lib/pickup-sheets.ts` so the home page shares it; the route is a thin wrapper.

## Package E — Hallmark Phase 1

Applied as specified: #4 (league nav `<img>` → `next/image`), #9 (`league.css :root` → `.league-root` — the layout already applies that class, so tokens stop leaking site-wide), #12 (contact hero `text-orange-100` → `text-white/85`), #18 (hex → tokens: `--accent-hover-light`, `--swap-selected`, `--note-special`; `!important` dropped via doubled-class specificity; hero 3-stop gradient collapsed to solid `var(--accent-dark)`), #19 (global `prefers-reduced-motion` guard), #20 (SiteNav shell explicit transition list, no `outline`), #25 (typographic "Cover image — pending" placeholder figures).

**#8 superseded per T02:** the stats bar is a live server-side fetch from PivotAttendance via `lib/pickup-sheets.getHomeStats()` (shared 300 s cache), labelled with denominators — *Players — ever played*, *Tracked sessions — since Jul 2024*, *Attendances — since Jul 2024*. The bar hides entirely if the sheet is unreachable (no hardcoded fallback numbers, per "no hardcoded counts anywhere").

**Deliberate deviation — #22:** the plan's `clip-path/opacity:0` replacement for the `-9999px` container would break the draft tool's PNG export — html2canvas captures `#draft-export-container` live, and opacity/clip-path hiding renders a blank image. Kept the offscreen positioning, added `aria-hidden="true"` + `pointer-events: none` (which addresses the a11y concern behind the finding). A fully compliant fix needs the export flow to render an on-demand clone — noted in the map as a small follow-up.

Two small notes: SiteNav's *dropdown* still uses `transition-all` (line ~198) — outside #20's scope (nav shell only), left for Phase 2. `lib/session.getConsecutiveWeeks()` is now unused — plan 006 (dead code) can delete it.

## Package F — §6 amendments + T03 calls

All 18 applied. Highlights:

- **Timeline rebuilt** (`about/Timeline.tsx`): founded 28 Sep 2018 · sessions formalised Jan 2024 (Villingili from 2 Feb 2024) · registered 3 Sep 2024 "as a sports association" · AGM 12 Dec 2024 · first tournament 24 Jan 2025 (5v5, 42 players, 7 teams) · WFDF granted Feb 2025 ("applied in late 2024") · Disc Wars 17–18 Oct 2025 (6v6, 64 players, 8 teams). The "August 2024 — Association founded" entry is **gone** (T03 C1 fold).
- Session time is 8:00 PM everywhere: play hero, calendar hero, `lib/calendar.ts` (3 hardcoded `'5:30 PM'`), `lib/session.ts` stale 17:30 comments (code already said 20:00).
- Membership fee: MVR 350 first year / 250 renewing (play page).
- Atolls: about-page cards and play page now say **event & outreach activity** (Eid Ufaa Apr 2025; Addu intro Nov 2025) — never "sessions".
- Placeholder news fixed: registration 3 Sep 2024 (A14); "League Season 1, Feb 2026, 240+ tracked sessions" replaces the impossible 113-consecutive-weeks item (A15/A3).
- Governance: five-year terms; WFDF "applied late 2024, granted February 2025" (A6/A10/C2). `config/board.json` terms → 2024–2029.
- Docs: both tech specs' timeline blocks and audience counts corrected (A16/A1); root `CLAUDE.md` — labelled player counts, "registered sports association", MFDF name framed as the all-disc-sports mandate design (A17/A18).
- A2 (attendances) is satisfied by the live stats (Package E) rather than a hardcoded 4,906.

**Deliberately skipped:** the dev showcases (`app/dev-preview/`, `app/_dev/`) keep their sample numbers (3481/113/167/2024–2028) — they're component demos with fake props, not public claims. Say the word and I'll scrub them too.

## Leftover manual steps for you

1. **Restart/redeploy consideration:** `.env.local` gained `SHEETS_API_KEY`, `SHEET_ID`, `PICKUP_ADMIN_PASSWORD_HASH`. When you eventually deploy, these three must be set in Vercel too — the payments page and home stats depend on them.
2. **Credential rotation** (owner-accepted risk, unchanged tonight): the Google Sheets API key and pickup admin password shipped in public bundles pre-004 and remain burned. When you rotate: new key with referrer/API restrictions → `SHEETS_API_KEY`; new password → bcrypt → `PICKUP_ADMIN_PASSWORD_HASH`. The old `NEXT_PUBLIC_*` lines in `.env.local` can then be deleted (nothing reads them anymore).
3. **Smoke-check in the browser** (I could not run the app against live services): `/pickup/payments` loads and admin unlock works; home page stats bar shows live numbers; `/league/spirit` → `/league` still shows the season name; draft-tool PNG export still renders (I preserved the offscreen container specifically for this — worth 30 seconds to confirm).
4. **Morning review of the timeline wording** on `/about` — the milestone copy is mine; facts are from spec §6/T03, but the phrasing is yours to taste.
5. Hallmark #22 follow-up (on-demand export clone) if you want the `-9999px` technique gone for real.

## Out of scope, untouched (as instructed)

Plans 002/005/006/007 · Hallmark Phases 2–3 · data section build (T05/T06) · `config/*.json` placeholder content (bios/mandates/sponsors still owed) · credential rotation · deployment.
