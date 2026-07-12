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

- The federation masthead's **League** link carries a small green crossover dot
  (`bg-green-400 w-1.5 h-1.5 rounded-full`) and opens in the same tab.
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
