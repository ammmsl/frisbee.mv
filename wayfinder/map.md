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

## Wave 1 status (2026-07-12, branch `wave-1-correctness`, unpushed)

- **Package A (T04 research)** — ✅ closed; asset `assets/T04-news-schema.md`
- **Package B (plan 001, league cache)** — ✅ done; note: only 6 of the plan's 8 handlers had writes (results/[matchId] and teams/route.ts are GET-only)
- **Package C (plan 003, admin hardening)** — ✅ done; all gates pass
- **Package D (plan 004, payments server-side)** — ✅ done; server env vars added to .env.local; rotation still owner-deferred
- **Package E (Hallmark P1)** — ✅ done; #8 superseded by live labelled stats; **#22 deviation**: -9999px offscreen kept for `#draft-export-container` because html2canvas captures it live and opacity/clip-path hiding produces a blank export — added aria-hidden + pointer-events:none instead; a compliant fix needs an on-demand clone render (small follow-up)
- **Package F (§6 amendments + T03 calls)** — ✅ done; all 18 applied; dev showcases (`app/dev-preview`, `app/_dev`) deliberately left with sample data

## Wave 2 + 3 status (2026-07-12, branch `wave-2-3-structure-and-chrome`, unpushed)

- **Wave 2 (plan 002, league query centralization)** — ✅ done; 30 loaders in `lib/league-queries.ts`, all key strings preserved, `getActiveSeason` merged under new `league-active-season-v2` key; drift check matched the expected Wave-1 baseline exactly; dead `getConsecutiveWeeks()` deleted. All plan gates pass.
- **Wave 3 (Hallmark Phase 2 chrome)** — ✅ done; 2a–2f all applied. Deviations/calls (details in `docs/wave-2-3-report.md`):
  - **Play dropdown flattened** — the N6 masthead carries a flat link row (About · Play · Rules · League · Pickup · News · Contact); the dropdown pattern doesn't exist in a masthead. Rules promoted to top level.
  - **lucide-react drift**: plan 2e only knew about PublicNav's Menu/X, but `FixturesCalendar.tsx` used 9 more icons. All 11 hand-rolled in `app/league/_components/icons.tsx` (same size/className API — FixturesCalendar only changed its import line); dependency dropped.
  - **--text-muted darkened** #6b7280 → #626d7b: gray-500 fell to 4.32:1 on the tinted surface; new value is 4.7:1 (AA).
  - **WFDF nav pill removed** — the masthead has no right-zone chrome; WFDF membership now lives in the hero badge + footer statement.
  - **League link opens same-tab** (was new-tab) per the plan's bridge decision, in both masthead and Drawer, with the green crossover dot.

## Not yet specified

- **Drafting the remaining 5 posts** — voice set by the two spec drafts (#1, #6); can't ticket until the section shape and sequence are locked.
- **Placeholder content replacement** — `config/committees.json`, `config/board.json`, `config/sponsors.json` need real content from the owner (spec §6); shape unknown until owner supplies it.
- **Later data waves** — demographics post (needs Tier-1 entry into `ufa.sqlite`), governance/volunteer wave (after launch voice proven).
- **Hallmark re-audit** — the plan's own exit criterion; only meaningful after Phase 3 lands.

## Out of scope

- League Tracker logic changes (separate concern; only the visual bridge from the Hallmark plan touches `app/league`).
- Vercel/domain work — manual, per CLAUDE.md.
- Any further analysis-repo work — that map is archived; this repo consumes its committed spec.
