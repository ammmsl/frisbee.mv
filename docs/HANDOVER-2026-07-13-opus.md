# HANDOVER — 2026-07-13, for the next session (Opus)

**From:** Fable 5 overnight session (Waves 4+5). **Why:** owner is low on Fable limit and has
reported visual regressions on the Vercel preview that need triage and fixing.

---

## 0. Where you are

- **Branch:** `wave-4-5-data-and-macros`, checked out, **pushed to origin** (owner lifted the
  no-push rule mid-run for Vercel preview testing — keep pushing verified commits so the
  preview updates). Tip: `7d0860e`. Base: `wave-2-3-structure-and-chrome` (unmerged to main).
- **Read in this order:** `wayfinder/map.md` → `docs/frisbee-mv-wave-4-5-report.md` →
  `docs/wave-2-3-report.md` (the chrome rebuild this feedback is about) → `CONTEXT.md`.
- Verification gates: `npx tsc --noEmit` and `npm run build` must exit 0 before every commit.
  `npm run lint` is known-broken on Next 16 — skip. Playwright MCP tools are available for
  browser checks against `npm run dev` (localhost:3000).
- Commit trailer: `Co-Authored-By: Claude <noreply@anthropic.com>` (adjust to your model name).

## 1. OWNER FEEDBACK TO FIX (their words: "There are alot of issues")

### 1a. "The logo icon and the transparent header is gone"

Triage done: `/logo.svg` exists and renders in `app/_components/SiteNav.tsx` — nothing is 404ing.
What the owner misses is the **pre-Wave-3 header**: the old sticky nav with the logo icon that
sat **transparent over the home hero** and went solid on scroll. Wave 3 (Hallmark 2c) replaced it
with the static centred N6 newspaper masthead and deleted the choreography. **The owner is
reversing that call — treat this like the Fraunces revert** (same pattern: Hallmark chrome change
→ owner morning review → revert).

How to restore (the old code is all in git history, pre-`5391716`):

```
git show 2a98ae4:app/_components/SiteNav.tsx     # old sticky/transparent nav
git show 2a98ae4:app/(site)/page.tsx             # had #hero-sentinel div at hero bottom
git show 2a98ae4:app/(site)/layout.tsx           # pt-16 offset for the fixed nav
git show 2a98ae4:app/pickup/layout.tsx           # same offset
```

Cautions when restoring:
- The old nav watched `#hero-sentinel` (1px div at the hero's bottom) — the hero has since been
  rewritten twice (2f transitional, then 3a Marquee Hero with the next-session right column).
  Re-add the sentinel to the CURRENT hero; don't revert the 3a hero unless 1b says so.
- The old nav had the Play dropdown + WFDF pill; Wave 3 flattened links (Rules top-level, pill
  removed) and same-tab League link with green dot. **Keep the Wave-3 link row decisions unless
  the owner says otherwise** — the complaint is about the logo + transparency, not the links.
  A hybrid (old sticky/transparent shell, current flat link set) is likely the right shape.
- `pt-16` offsets must come back on `(site)` and `pickup` layouts or content hides under the
  fixed nav. PickupNav sits directly under the masthead — re-test that seam.
- Drawer must keep working (it's shared); Hallmark P1 #20 fixed `transition-all` → explicit
  transition list on the old nav — preserve that fix when resurrecting old code.
- Afterwards update: `CONTEXT.md` chrome table, `.hallmark/log.json` chrome block, ADR 0001/0002
  mentions of "N6", `docs/frisbee-mv-design-system.md` (nav row), and the map (owner reversal,
  like the Fraunces entry).

### 1b. "The text layout is all over the place"

The owner is reacting to the Wave-5 macro rewrites (and possibly genuine breakage). Do this
empirically, not from memory:

1. `npm run dev`, then Playwright-screenshot every changed page at 375 / 768 / 1440:
   `/`, `/about`, `/governance`, `/play`, `/contact`, `/sponsors`, `/pickup`, `/data`, `/news`.
2. Look for actual breakage first: overlap, clipped text, horizontal scroll, the home hero's
   right column colliding with the headline at mid widths (`lg:grid-cols-[minmax(0,1fr)_auto]`),
   the About wide-left-margin (`lg:ml-36`) reading as misalignment, the governance five-numeral
   grid wrapping oddly.
3. Then bias toward the owner's taste: they clearly prefer conventional/centred over the
   asymmetric-editorial shapes. Where a macro reads as "all over the place", pull it back toward
   a simpler, straighter version of the same shape (e.g. drop the `lg:ml-36` indents on
   About/Governance prose; consider re-centring section headers). Do NOT reintroduce the listed
   anti-patterns wholesale; but owner preference outranks the Hallmark plan — when in doubt,
   simpler and more conventional wins, and record the reversal in the map.
4. Each fix = per-page commit, tsc+build green, push.

Package D commits are one-per-page precisely so you can `git revert` any single page if the
owner would rather have the old version of a page back entirely:
3a `91bc2d4` home · 3b `703003a` about · 3c `3dd9146` governance · 3d `856251d` play ·
3e `31d5e57` contact · 3f `6096bf7` sponsors · 3g `30b5b6a` pickup.
(Note: reverting 3a will conflict with the 1a sentinel work — do 1a and any 3a decision together.)

### 1c. "Running the sql didn't update"

The owner ran `migrations/001-news-category.sql` (Supabase) but "didn't update". Nothing
*visibly* changes after the migration until a post has `category='research'` — that may be the
whole story, or there's a real bug. Diagnose in this order:

1. **Env check:** does the Vercel preview even have `DATABASE_URL` (+ JWT/admin vars)? First
   deploy of this repo — env vars may be absent or pointing at a different database than the one
   the SQL ran against. Locally: confirm `.env.local` DB is the same Supabase project.
2. **Column check:** `SELECT column_name FROM information_schema.columns WHERE table_name='news_posts';`
   — confirm `category` exists (did the ALTER actually run without error? The editor may have
   been on a different schema).
3. **Write path:** in `/admin/news`, edit a post → Category=Research → Save; then check the row
   in Supabase. The PATCH path (`app/api/admin/news/[postId]/route.ts`) drops `category`
   silently if `newsCategoryColumnExists()` (in `lib/events.ts`) returns false — it caches
   `true` only, re-checks while false, so post-migration it should pass on the next request.
   If it doesn't: check the information_schema query against the actual schema (it filters
   `table_name` only, no `table_schema` — a candidate bug if multiple schemas have
   `news_posts`).
4. **Read path:** `/news` tabs — a research post must appear under Research. Reads use
   `COALESCE(to_jsonb(news_posts)->>'category','news')` and work with or without the column.
5. Whatever the cause, write the fix + what you found in the wave report addendum.

## 2. After the fixes: run the checks

Work through "Manual / browser checks left for you" in `docs/frisbee-mv-wave-4-5-report.md`
(§end) with Playwright — especially:

- `/data` index + spot-open reports; **agm-finance and nq-5 must render cleanly** (their
  HTML/JS was hand-redacted — check the d3/Plot charts still draw).
- Reduced-motion + keyboard pass on changed pages; 320px no-horizontal-scroll sweep.
- League pages against the live DB if env vars exist (`/league`, `/standings`, one team, one
  match) — exercises the Wave-2 centralized queries.

Record results (pass/fail per check) in the wave report or a short addendum.

## 3. Standing constraints (do not violate)

- **Privacy line (non-negotiable):** only PUBLIC/INTERNAL-aggregate ships; never OWNER-CODED/
  RESTRICTED, role-tied load, or individual money. **oms-15 + b-tb1 stay withheld** from
  `public/data/` until the owner rules (see map "Not yet specified").
- **No display serif** — single-font Inter, owner call.
- CLAUDE.md hard rules: no `<form>`, no bare `<img>`, `'use client'` leaf-only, 44px targets,
  MVT times, async params, `revalidate = 0` on dynamic public pages.
- `app/league/*` untouched (except nothing).
- No new dependencies; minimal diffs; prefer deleting over adding.

## 4. Open owner decisions (don't resolve yourself — they're queued in the map)

1. T05 defaults reaction, incl. whether `/data` gets a masthead/footer entry.
2. oms-15 / b-tb1: ship or keep internal.
3. soc-4 introducer table / oms-6 single-patron sentence: optional prunes.
4. Placeholder content (board bios, committee mandates, sponsors) — owner-owed before launch.
5. Credential rotation (risk-accepted, still pending).

## 5. Out of scope (unchanged from the overnight charter)

Plans 005/006/007 · drafting the 5 remaining Research posts (owner voice — never seed/publish
posts) · deployment/domain config beyond keeping the preview branch green · Hallmark re-audit
(only after the owner settles 1a/1b) · dev showcases.
