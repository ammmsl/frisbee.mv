# ADR 0002 — Per-page macrostructure rotation

**Status:** Accepted (decided 2026-05-20 grilling session; implemented Wave 5, 2026-07-13)

## Context

The 2026-05-20 Hallmark audit's largest finding was structural sameness: every `(site)/*` page
opened with the same accent-band hero + centred h1 + centred tagline — five colour-swaps of one
template, which reads as AI-generated.

## Decision

**No two federation sub-pages share a macrostructure.** Each page gets its own deliberate shape,
chosen for its content's job, and the assignment is recorded so future pages and audits respect it.

| Page | Macrostructure |
|---|---|
| Home `app/(site)/page.tsx` | Marquee Hero |
| About `app/(site)/about/page.tsx` | Long Document |
| Governance `app/(site)/governance/page.tsx` | Stat-Led |
| Play `app/(site)/play/page.tsx` | Workbench |
| Contact `app/(site)/contact/page.tsx` | Letter |
| Sponsors `app/(site)/sponsors/page.tsx` | Quote-Led |
| Pickup hub `app/pickup/page.tsx` | Typographic List |
| Data & Research `app/(site)/data/page.tsx` | Curated Index (typographic list) — added Wave 4 |

The machine-readable copy of this table lives in `.hallmark/log.json`; each page file carries a
stamp comment (`/* Hallmark · macrostructure: … */`) at the top.

## Rules for new pages

1. Pick a macrostructure **not already in the table**, or make the case for why an existing one
   is genuinely the right shape (and record the collision here).
2. Anti-pattern floor, always: not centred-everything, no 3-column feature grid, no
   eyebrow-on-every-section, no card-in-card.
3. Stamp the page (`macrostructure · theme · paper · accent`) and update `.hallmark/log.json`.
4. The chrome (transparent sticky nav — N6 masthead reverted by owner 2026-07-13 — Ft5 statement
   footer, tinted pacific paper) is shared and fixed — rotation applies to page bodies, not chrome.
5. Typography is **single-font Inter** — weight and size carry hierarchy. A Fraunces display
   serif was trialled and **reverted by owner call (2026-07-12)**; do not reintroduce one.

## Consequences

- Page reviews check shape first, styling second.
- The league sub-site is exempt (ADR 0001) — it is a different product with its own system.
- News/events/calendar (Phase 2 DB-driven pages) still carry the old accent-band header; they
  were not in the Phase 3 scope and are the natural next rotation candidates.
