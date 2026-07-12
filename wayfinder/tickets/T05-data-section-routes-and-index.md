# T05 — Data-section routes and archive index design

Type: wayfinder:prototype (HITL)
Status: closed (2026-07-13 — prototype built; defaults await owner reaction)
Assignee: Claude (Wave 4 overnight session)
Blocked-by: T04

## Question

Pin the URL and page shape for the data section: route for the curated archive index (e.g. `/data`), how the static report HTML is served (`public/data/*.html` per spec §4 — confirm), how Research posts surface (news list filter vs dedicated landing), and the post ↔ "read the full report" linking convention. Produce a cheap prototype (route stub + index page sketch) for the owner to react to.

## Resolution

Prototype shipped on `wave-4-5-data-and-macros` (commit "T05 prototype"). Defaults locked,
**pending owner reaction** (recorded in the map):

- Index at **`/data`** — `app/(site)/data/page.tsx`, inside the site chrome; Curated Index
  macrostructure (typographic list grouped by the spec §3 themes, no cards, no new deps).
- Reports served as **static files** from `public/data/<slug>.html` (spec §4 confirmed);
  their CSS/JS assets ride along under `public/data/lib/`.
- Research posts surface **through the news list** via the T04 category filter — no separate
  landing.
- Post → report linking = a plain **"Read the full report →" markdown anchor** in the post
  body; no component.
- **Not done, owner call:** a masthead/footer entry for `/data` — chrome was frozen this wave.
