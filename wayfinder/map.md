# Map: Post-publish improvement route for frisbee.mv

Label: `wayfinder:map` · Created 2026-07-12 · Tracker: local markdown (this directory)
Tickets: `wayfinder/tickets/T*.md` — a ticket is **claimed** when its `Assignee:` field is set, **closed** when `Status: closed`. `Blocked-by:` lists ticket ids; a ticket is on the **frontier** when open, unassigned, and every Blocked-by ticket is closed.

## Destination

A locked, sequenced implementation route for all post-publish work — the Hallmark remediation (3 phases), the UFA data section (posts + archive), the 18 site amendments, and the architecture-audit adoptions — with every open owner decision resolved, so implementation sessions can execute without anything left to decide.

## Notes

- The three planning artifacts this map routes between:
  - [Hallmark remediation plan](../docs/frisbee-mv-hallmark-remediation-plan-v1.0.md) (2026-05-20 audit; untracked — commit it when adopted)
  - [UFA data publication spec v1.0](../docs/frisbee-mv-ufa-data-publication-spec-v1.0.md) (committed 2026-07-12; folds the analysis repo's wayfinder T01–T12)
  - [Architecture audit report](assets/T01-architecture-audit-report.md) + executor plans in [`plans/`](../plans/README.md)
- Source analysis repo: `C:\Users\amsal\Documents\Projects\UFA Analysis` (branch `analysis/rebuild`) — assets under `wayfinder/archive/publication-handoff/assets/`.
- Privacy line is non-negotiable: only PUBLIC and INTERNAL-aggregate figures ship; never OWNER-CODED/RESTRICTED, role-tied load, or individual money (spec §1, §3.3).
- ~~3,481-stat conflict~~ resolved in T02: stats are a live server-side fetch with labelled denominators; Hallmark P1 item #8 superseded.
- Skills every session should consult: /grilling + /domain-modeling for HITL tickets; /hallmark for design-phase questions.
- Post-publish delta already in the repo (context, not work): league sub-site (`app/league/*`, ~16 pages, distinct green identity), membership calculator (`/pickup/membership`), design-system expansion (`docs/frisbee-mv-design-system.md`), sponsor page rework, caching/deploy fixes (April 2026).

## Decisions so far

<!-- one line per closed ticket -->

- [Adopt or defer the architecture-audit findings](tickets/T01-adopt-architecture-audit-findings.md) — all seven plans adopted; credential rotation risk-accepted until 004 deploys; session time settled at 8:00 PM by spec A12
- [Lock the implementation sequence](tickets/T02-lock-implementation-sequence.md) — six waves: correctness+security (001/003/004 + Hallmark P1 + 18 amendments) → 002 → chrome → data section → per-page macros → 005–007; stats become live server-side fetch with labelled denominators
- [Owner calls: publication blockers](tickets/T03-owner-calls-publication-blockers.md) — b-tb2 ships with caveat; GSP stays named; C1 folds into registration, C2 softens to "late 2024", C3–C7/C9 confirmed; only agm-finance + nq-5 need redaction
- [News engine Research category](tickets/T04-news-schema-research-category.md) — no category field exists (NewsFilter fakes it via title regex); minimal spec = one CHECK-constrained `category` column + six touchpoints, asset `assets/T04-news-schema.md`; implement in Wave 4
- [Data-section routes and index](tickets/T05-data-section-routes-and-index.md) — prototype built: `/data` index, static reports in `public/data/`, Research via news filter, plain read-the-full-report anchor; **defaults await owner reaction**; no nav entry yet (owner call)
- [Transfer and redact archive pages](tickets/T06-transfer-and-redact-archive-pages.md) — 36 shipped (agm-finance + nq-5 redacted; b-tb2/a-tb1 per T03); **oms-15 + b-tb1 withheld** on privacy-sweep role-tied-load findings (owner call)

## Wave 1 status (2026-07-12, branch `wave-1-correctness`, unpushed)

- **Package A (T04 research)** — ✅ closed; asset `assets/T04-news-schema.md`
- **Package B (plan 001, league cache)** — ✅ done; note: only 6 of the plan's 8 handlers had writes (results/[matchId] and teams/route.ts are GET-only)
- **Package C (plan 003, admin hardening)** — ✅ done; all gates pass
- **Package D (plan 004, payments server-side)** — ✅ done; server env vars added to .env.local; rotation still owner-deferred
- **Package E (Hallmark P1)** — ✅ done; #8 superseded by live labelled stats; **#22 deviation**: -9999px offscreen kept for `#draft-export-container` because html2canvas captures it live and opacity/clip-path hiding produces a blank export — added aria-hidden + pointer-events:none instead; a compliant fix needs an on-demand clone render (small follow-up)
- **Package F (§6 amendments + T03 calls)** — ✅ done; all 18 applied; dev showcases (`app/dev-preview`, `app/_dev`) deliberately left with sample data

## Wave 2 + 3 status (2026-07-12, branch `wave-2-3-structure-and-chrome`, unpushed)

- **Wave 2 (plan 002, league query centralization)** — ✅ done; 30 loaders in `lib/league-queries.ts`, all key strings preserved, `getActiveSeason` merged under new `league-active-season-v2` key; drift check matched the expected Wave-1 baseline exactly; dead `getConsecutiveWeeks()` deleted. All plan gates pass.
- **Wave 3 (Hallmark Phase 2 chrome)** — ✅ done; 2a–2f applied, then **2a (Fraunces) reverted by owner call** (2026-07-12 morning review: "the home font change is unnecessary — stick to the design tokens"). The site stays single-font Inter; Hallmark Phase 3 macros must NOT reintroduce a display serif. Other deviations/calls (details in `docs/wave-2-3-report.md`):
  - **Play dropdown flattened** — the N6 masthead carries a flat link row (About · Play · Rules · League · Pickup · News · Contact); the dropdown pattern doesn't exist in a masthead. Rules promoted to top level.
  - **lucide-react drift**: plan 2e only knew about PublicNav's Menu/X, but `FixturesCalendar.tsx` used 9 more icons. All 11 hand-rolled in `app/league/_components/icons.tsx` (same size/className API — FixturesCalendar only changed its import line); dependency dropped.
  - **--text-muted darkened** #6b7280 → #626d7b: gray-500 fell to 4.32:1 on the tinted surface; new value is 4.7:1 (AA).
  - **WFDF nav pill removed** — the masthead has no right-zone chrome; WFDF membership now lives in the hero badge + footer statement.
  - **League link opens same-tab** (was new-tab) per the plan's bridge decision, in both masthead and Drawer, with the green crossover dot.

## Wave 4 status (2026-07-12/13, branch `wave-4-5-data-and-macros`, **pushed to origin at owner's mid-run request** for a Vercel preview test)

- **Package A (T04 implementation)** — ✅ done; `category` column spec'd in `migrations/001-news-category.sql` (**owner must run it manually in Supabase**); all six touchpoints + NewsFilter rebuilt on the real field; code is default-safe pre-migration (column absent → everything reads as 'news').
- **Package B (T05 prototype)** — ✅ built. **Defaults locked, PENDING OWNER REACTION:**
  - Archive index at **`/data`** (`app/(site)/data/page.tsx`, inside the site chrome).
  - Report HTML served as **static files from `public/data/<slug>.html`** (spec §4 confirmed).
  - Research posts surface **through the news list** via the new category filter — no separate landing.
  - Post → report linking = a plain **"Read the full report →" anchor** in the post markdown (no component).
  - Index groups reports by the spec §3 themes; typographic list, no cards, no new deps.
  - **Deliberately NOT added:** a masthead or footer link to `/data` — chrome is frozen this wave; owner to decide where (if anywhere) it enters the nav.
- **Package C (T06 transfer)** — ✅ done, **36 pages shipped** to `public/data/` (+ `lib/` assets). Redactions applied: agm-finance (R2 collection-mechanics + ghost finding, Findings AND Method), nq-5 (k-core null tiles/figure/finding/method/JSON). b-tb2 + a-tb1 ship as-is per T03. **Count note:** the run instruction said "the 34 publish-as-is (≤ 34)" but also ordered the needs-redaction work — the cleared set is 38 (34 + 2 redacted + 2 per T03); see below for why 36 shipped.
- **⚠ OWNER CALL NEEDED — two T11 publish-as-is pages WITHHELD on privacy-sweep findings:** **oms-15** and **b-tb1** carry **per-office centrality tables** (President 70 inbound @-mentions · rank #5 of 136 · top 97%; Treasurer 52 · #11; Vice-President 34 · #15; Secretary 21 · #28 — in tables, stat tiles AND the JSON blobs). That is role-tied load, which the privacy line marks non-negotiable — the same material that made oms-3 internal-only. T11 called these pages "aggregate rank facts"; the sweep disagrees. Withheld rather than shipped (the branch is now being pushed for Vercel preview, so under-shipping is the reversible direction). To restore: copy the two files from the analysis repo and re-add their two index entries in `app/(site)/data/page.tsx`. Two borderline items shipped WITH flags (details in the wave report): soc-4's opaque-id introducer counts (page labels them chat-derived proxy, not owner-coded) and oms-6's "exactly one paid, zero-attendance patron" sentence.

## Wave 5 status (2026-07-13, same branch)

- **Hallmark Phase 3 per-page macros — ✅ all seven shipped, one commit per page** (revert any single page independently): 3a home Marquee Hero (next session into the hero right column; stats bar now a typographic row via `StatTile bare`; live labelled fetch untouched) · 3b about Long Document (Timeline flattened to a single-column spine; Where We Play as `<dl>`) · 3c governance Stat-Led (five anchored numerals; President spans 2 columns; committees restored as a names-only list — placeholder mandates withheld from render) · 3d play Workbench (next-session utility block top; typographic rules close; **also fixed stale orange hovers** `#e55a27`/`#cc4f22` → accent tokens) · 3e contact Letter · 3f sponsors Quote-Led (post-publish "Ways to Help" 3-col icon grid flattened to a stacked list — nearest compliant shape, content preserved) · 3g pickup hub Typographic List.
- No Fraunces anywhere (owner call honored — Inter weights where the plan said Fraunces). Chrome untouched except deleting the orphaned `--note-special` token. `npx tsc --noEmit` + `npm run build` exit 0 after every page. Nothing reverted.
- **Followups (Package E) — ✅** ADRs 0001/0002, `CONTEXT.md`, `.hallmark/log.json`, CLAUDE.md design-system pointer section (stale disc-orange table replaced).
- News/events/calendar pages still carry the old accent-band header — they were outside the plan's 3a–3g scope; natural next rotation candidates (noted in ADR 0002 / log.json `unassigned`).

## Owner-feedback session (2026-07-13, Opus, same branch — pushed)

Worked the three items from `docs/HANDOVER-2026-07-13-opus.md`. Full write-up: wave-4-5 report addendum.

- **1a — N6 masthead REVERTED to the transparent sticky nav** (`2cb6896`) — **owner call, 2nd chrome reversal after Fraunces.** `SiteNav.tsx` restored wholesale from `2a98ae4`; `pt-16` back on `(site)`+`pickup` layouts; `-mt-16` + `#hero-sentinel` re-added to the current Marquee Hero (hero unchanged). **This supersedes the Wave-3 nav bullets above:** the Play dropdown, WFDF pill, and new-tab League link are back; the flat masthead link row, top-level Rules, and green League crossover dot are gone. Owner reasoning: flat links were poor for quick access (dropdown preferred), and the green "live" dot mis-signalled — **league is on break and slated for a major rework, so its nav link is just a low-key way out.**
- **1b — layout fixes** (`6597b44` real breakage: governance/play table `min-w-max` clip + PersonCard name truncation; `dfffd1b` taste: dropped About's `lg:ml-36` prose indents). Home/sponsors/pickup/news/contact/data read fine, left alone.
- **1c — migration "didn't update" = NO BUG.** DB verified: `category` column exists in `public.news_posts` (default `'news'`); `news_posts` is public-only (handover's schema-filter candidate bug is inert); all 6 posts are `category='news'`, so the Research tab is empty *by design* until a post is marked research. Write→read→filter chain proved via a rolled-back transaction. Owner action: set a post to Research in `/admin/news`.

## Not yet specified

- ~~OWNER FEEDBACK 2026-07-13 (preview review)~~ — **RESOLVED this session** (see the owner-feedback section above). Nav reversal is what the owner wants; layout breakage fixed; migration confirmed working.
- **T05 defaults await owner reaction** (Wave 4 above) — including whether `/data` gets a masthead or footer entry (currently reachable by URL and from Research posts only; chrome was frozen this wave).
- **oms-15 + b-tb1: ship or keep internal** — withheld by the Wave-4 privacy sweep (per-office centrality tables = role-tied load) despite T11 publish-as-is verdicts. If shipping: copy from the analysis repo + re-add the two index entries in `app/(site)/data/page.tsx`.
- **Run `migrations/001-news-category.sql`** in the Supabase SQL editor (manual; code is default-safe until then).
- **Drafting the remaining 5 posts** — voice set by the two spec drafts (#1, #6); can't ticket until the section shape and sequence are locked.
- **Placeholder content replacement** — `config/committees.json`, `config/board.json`, `config/sponsors.json` need real content from the owner (spec §6); shape unknown until owner supplies it.
- **Later data waves** — demographics post (needs Tier-1 entry into `ufa.sqlite`), governance/volunteer wave (after launch voice proven).
- **Hallmark re-audit** — the plan's own exit criterion; only meaningful after Phase 3 lands.

## Out of scope

- League Tracker logic changes (separate concern; only the visual bridge from the Hallmark plan touches `app/league`).
- Vercel/domain work — manual, per CLAUDE.md.
- Any further analysis-repo work — that map is archived; this repo consumes its committed spec.
