# Wave 2 + 3 Report — Structure & Chrome

**Branch:** `wave-2-3-structure-and-chrome` (left checked out, **not pushed**; branched off `main` at `8c52c81`)
**Run:** overnight session, 2026-07-12
**Verification:** `npx tsc --noEmit` and `npm run build` exited 0 after each package and on the final tree. `npm run lint` skipped — known-broken on Next 16 (plan 006 fixes it). Nothing was reverted; both packages shipped.

## Commits (oldest first)

| Commit | Package |
|---|---|
| `2a98ae4` | **A** — Wave 2: plan 002 league query centralization + dead-code deletion |
| `5391716` | **B** — Wave 3: Hallmark Phase 2 chrome rebuild (2a–2f) |
| *(this commit)* | Docs: plans/README 002 row, BUILD-PROGRESS, design-system, map, this report |

---

## Package A — Wave 2 (plan 002)

**Drift check** (`git diff --stat a19e878..HEAD` over the in-scope files): every touched file matched the known Wave-1 baseline (plan 001 invalidation calls, key renames, `revalidate: 300`; Hallmark P1 touches to PublicNav/league.css). No unexpected drift → no STOP.

What shipped:

- `lib/league-queries.ts` created — **all 30 cached loaders** from the 11 public league pages, moved with byte-identical SQL. One shared `LEAGUE_CACHE` (`tags: ['league']`, `revalidate: 300`) and a `key()` helper; **every pre-existing cache-key string preserved** (`league-form-guide`, `league-team-roster-with-stats`, etc.).
- **`getActiveSeason` 4-way merge**: the four per-page variants collapsed into one canonical superset (`season_id, season_name, status`) under the **new** key `league-active-season-v2` (a new key so no stale narrower-shape entry can be served). Callers adapted — spirit page now reads `.season_id` from the row.
- Row types (`StatRow`, `MatchweekRow`, `MvpRow`, `MvpHistoryRow`) moved with their loaders; the stats/mvp pages re-export them so `StatsClient`/`MvpClient`'s `import type ... from './page'` is untouched.
- Public league pages no longer import `lib/league-db`; only `app/league/admin/**` still does (in-scope-exempt, queries live).
- `lib/session.ts` — dead `getConsecutiveWeeks()` + its `FIRST_SESSION_DATE` constant deleted (unused since Wave 1's live home stats).

**Plan 002 gates, all pass:**

| Gate | Expected | Result |
|---|---|---|
| `grep -rn "const getActiveSeason" app/league` | 0 | 0 ✓ |
| `grep -rn "unstable_cache(getStandings" app/league` | 0 | 0 ✓ |
| `grep -rln "unstable_cache" app/league --include=*.tsx` | 0 files | 0 ✓ |
| `league-db` imports in league tsx | admin only | `admin/dashboard/page.tsx` only ✓ |
| `grep -c "LEAGUE_CACHE" lib/league-queries.ts` ≥ 30 | ≥ 30 | 36 ✓ |
| `npx tsc --noEmit` / `npm run build` | exit 0 | 0 / 0 ✓ |
| Files outside scope modified | none | only `lib/session.ts` (explicitly instructed) ✓ |

One implementation note: the plan's literal `as const` on `LEAGUE_CACHE` doesn't typecheck (`unstable_cache` wants a mutable `tags: string[]`) — replaced with an explicit annotation, semantics identical. Net diff: **−1,118 lines** across the 11 pages.

---

## Package B — Wave 3 (Hallmark Phase 2)

- **2a Fraunces** — loaded in `app/layout.tsx` via `next/font/google` (variable `wght` 400..900 by default + `axes: ['opsz']`), exposed as `--font-fraunces`, mapped in `@theme` to `--font-display` → Tailwind `font-display` utility. Usage discipline (hero h1 + major section h2 only, federation pages only) encoded as the header comment of `globals.css` and applied to the home hero h1 + its two section h2s. Confirmed in the built CSS: `.font-display{font-family:var(--font-display)}` and self-hosted Fraunces woff2s emitted. Remaining `(site)/*` page headings pick it up in Phase 3 per-page macros.
- **2b Tinted paper** — `--bg-page`/`--color-bg-page` → `oklch(98.5% 0.005 230)` (≈ #f9fbfc), `--bg-surface`/`--color-bg-surface` → `oklch(96.5% 0.008 230)` (≈ #eef3f5); `lib/tokens.ts` mirrored in hex. Contrast (computed, WCAG relative-luminance): primary text 17.09:1 on page / 15.86:1 on surface. **Deviation-adjacent fix:** `--text-muted` (#6b7280, gray-500) fell to **4.32:1** on the tinted surface — below AA for body-size text — so it was darkened to **#626d7b** (5.07:1 page / 4.70:1 surface). League dark theme untouched.
- **2c SiteNav → N6 masthead** — full rewrite, same filename: centred wordmark over a 1px `var(--accent)` rule, flat link row beneath, **static** (scrolls off; no sticky card, no shadow, no transform). `#hero-sentinel` deleted from the home page along with the entire transparent→solid scroll choreography; `(site)` and `pickup` layouts drop their `pt-16` fixed-nav offsets. League link gets the small green crossover dot (`bg-green-400 w-1.5 h-1.5 rounded-full`) and opens same-tab. Mobile: 44×44 hamburger right-anchored under the rule, reusing `Drawer.tsx` (drawer's League entry matched: same-tab + dot). **Call made:** the old Play hover-dropdown was flattened — a newspaper masthead carries a flat row, so *Rules* is now a top-level link (About · Play · Rules · League · Pickup · News · Contact). The WFDF pill left the nav; membership is stated in the hero badge and footer statement.
- **2d SiteFooter → Ft5 statement** — full rewrite: one declarative paragraph (WFDF membership link + "follow us on Instagram and TikTok at @frisbee.mv" folded inline), one wrap-row of site links (44px targets), one contact line. No 4-column grid, no social-icon strip, no copyright tail.
- **2e League bridge + lucide drop** — `← frisbee.mv` back-link (text-xs, gray-500) sits left of the league wordmark. **Known drift handled:** the plan only knew about PublicNav's `Menu`/`X`, but `FixturesCalendar.tsx` imported 9 more lucide icons. All 11 are now hand-rolled 24×24/stroke-2 inline SVGs in `app/league/_components/icons.tsx` with the same `size`/`className` API — FixturesCalendar's only change is its import line (the 778-line god file stays otherwise untouched, per the audit's no-refactor-without-tests stance). `lucide-react` removed from `package.json` via `npm uninstall`; zero references remain in code, lockfile, or `node_modules`.
- **2f Transitional home hero** — `min-h-screen` centred hero replaced by a content-height (`py-20 sm:py-28`), left-biased block in a `max-w-2xl` column; h1 in Fraunces. HeroCarousel, gradient fallback, radial highlight, dark tint overlay and the WFDF badge (now in-flow under the CTAs) all preserved — LCP path unchanged. Full Marquee Hero remains Phase 3a.

**Phase 2 verification list — static results:**

- `npm run build` ✓ (exit 0, all 36+ routes emit).
- WCAG AA on tinted paper ✓ (numbers above; muted token fixed).
- No `(site)/*` accent-band hero was touched — the plan says those live until Phase 3 ✓.
- League renders in its own green palette — no shared-token change touched `league.css`; the only league-side edits are the back-link and icon imports ✓ (token scoping was already fixed in Wave 1 #9).
- Hard rules: no `<form>`, no bare `<img>`, `'use client'` only on leaf components (SiteNav/Drawer/PublicNav/FixturesCalendar were already client leaves), 44×44 targets on every interactive chrome element ✓.

---

## Deviations & calls (summary — also recorded in the map)

1. **Play dropdown flattened** to a top-level Rules link (masthead = flat row). Reverse by re-adding a dropdown if you want it back, but it would fight the N6 shape.
2. **FixturesCalendar lucide drift** → 11 hand-rolled icons in `app/league/_components/icons.tsx` instead of the plan's 2.
3. **`--text-muted` darkened** #6b7280 → #626d7b for AA on the tinted surface (design-system doc updated; league dark theme untouched).
4. **WFDF pill removed from nav** — masthead has no right zone; hero badge + footer statement carry it.
5. **`LEAGUE_CACHE` typed annotation** instead of the plan's `as const` (typecheck requirement, same values).
6. Wave 1's #22 html2canvas deviation is untouched and still stands.

## Manual / browser checks left for you

1. **Look at the chrome** — `/`, `/about`, `/play`, `/governance`, `/sponsors`, `/contact`, `/news`: masthead identical and centred on all, scrolls off (no sticky), Fraunces visible on the home h1/h2s, paper visibly off-white next to a pure-white window.
2. **Mobile (≤640px)**: hamburger under the rule opens the Drawer; League entry shows the green dot; Escape/Tab focus trap still works; no horizontal scroll at 320/375px.
3. **League bridge**: `/league` topbar shows `← frisbee.mv` and it navigates home; fixtures page icons (calendar, chevrons, coffee/holiday, grid/list toggle) all render — these are my hand-rolled SVGs, worth an eyeball against how it looked before.
4. **League pages against a live DB** (I had no live data): `/league`, `/league/standings`, `/league/spirit`, one team page, one match page — all render with data. This exercises every centralized query; shapes are unchanged so risk is low, but it's the one thing static gates can't prove.
5. **Reduced-motion + keyboard pass** on the new masthead/footer (focus rings on links, drawer).
6. **Pickup pages**: PickupNav sits directly under the masthead with no gap (the `pt-16` wrapper is gone).
7. Wordmark size in the masthead is 132×52 (was 120×47) — taste call, easy to tweak in `SiteNav.tsx`.

## Out of scope, untouched (as instructed)

Plans 005/006/007 · Hallmark Phase 3 (per-page macros) · data section build (T05/T06) · `config/*.json` placeholder content · credential rotation · deployment · dev showcases (`app/dev-preview`, `app/_dev` — note their samples still render with the old chrome assumptions; they're demos, not public claims).
