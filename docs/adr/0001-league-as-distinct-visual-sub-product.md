# ADR 0001 — The league is a distinct visual sub-product

**Status:** Accepted (decided 2026-05-20 grilling session; recorded 2026-07-13)

## Context

frisbee.mv carries two surfaces: the federation site (`app/(site)/*`, `app/pickup/*`) and the
league sub-site (`app/league/*`, ~16 pages). The league was built with its own identity —
green accent on a dark theme — while the federation uses pacific-blue on tinted light paper.
The 2026-05-20 Hallmark audit asked whether to unify them.

## Decision

The league **stays visually distinct**. Green-on-dark is a deliberate sub-product identity, not
drift. The two surfaces are joined by an honest, minimal bridge instead of a shared skin:

- The federation nav's **League** link is a minimal bridge into the sub-product. (It briefly
  carried a green crossover dot + same-tab open in Wave 3; the **2026-07-13 nav revert** dropped
  both — the dot mis-signalled "live" while the league is on break/awaiting rework, so the link
  is now a plain new-tab exit. Restore a crossover signal when the league relaunches.)
- The league topbar carries a `← frisbee.mv` back-link left of its wordmark.
- League tokens are scoped to `.league-root` (never `:root`) so nothing bleeds either way.

## Rationale

A league night has different jobs (standings, fixtures, live results) and a different register
(competitive, evening, scoreboard-dark) from an institutional federation site. Forcing one skin
would flatten both. The signalled handoff tells the visitor "you are crossing into a sibling
product" without pretending the two are one page.

## Consequences

- Chrome work on the federation side must not touch `league.css` tokens or `PublicNav` beyond
  the bridge elements.
- New league pages follow the league's own green/dark system, not the federation macros
  (see ADR 0002 — the rotation rule applies to federation pages only).
- Single-font note: the whole product (both surfaces) is **Inter only**. A Fraunces display
  serif was trialled in Hallmark Phase 2 and **reverted by owner call (2026-07-12)** — do not
  reintroduce a display serif on either surface.
