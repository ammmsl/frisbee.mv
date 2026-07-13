# CONTEXT.md — frisbee.mv glossary & design map

The project's shared vocabulary. For build state see `docs/frisbee-mv-BUILD-PROGRESS.md`;
for design values see `docs/frisbee-mv-design-system.md`; for the reasoning behind the two
big design decisions see `docs/adr/`.

## Terminology

| Term | Meaning |
|---|---|
| **Federation site** | The public institutional surface: `app/(site)/*` + `app/pickup/*`. Pacific-blue accent on tinted light paper. |
| **League sub-site** | `app/league/*` (~16 pages). Deliberately distinct green-on-dark sub-product (ADR 0001). Tokens scoped to `.league-root`. |
| **UFA** | Ultimate Frisbee Association — the org name everywhere in site content. "MFDF" appears only in WFDF-registration contexts. |
| **Chrome** | The shared shell: nav, footer, paper tint. Fixed across all federation pages. |
| **Macrostructure** | A page body's overall shape (see rotation table below). No two federation sub-pages share one (ADR 0002). |
| **The archive / data section** | `/data` index + static report pages in `public/data/*.html` — vetted, de-identified analysis of club records (publication spec: `docs/frisbee-mv-ufa-data-publication-spec-v1.0.md`). |
| **Research post** | A news post with `category='research'` — the narrative front door into the archive. |

## Chrome archetypes (fixed)

| Element | Archetype | Shape |
|---|---|---|
| Nav | **Transparent sticky nav** | `fixed` top bar: logo left, link row right (Play dropdown, League→new-tab, WFDF pill). Transparent white-on-hero on the home page, goes solid (white + shadow) on scroll; solid everywhere else. Layouts offset it with `pt-16`; the home hero uses `-mt-16` + `#hero-sentinel`. **The N6 Newspaper Masthead (Hallmark 2c) was reverted by owner call (2026-07-13)** — 2nd chrome reversal after Fraunces; owner found the flat masthead link row poor for quick access and missed the logo + transparency. Do not reintroduce the static masthead. |
| Footer | **Ft5 Statement** | One declarative paragraph (WFDF membership + socials folded inline), one wrap-row of links, one contact line. No column grid, no copyright tail. |
| Paper | **Tinted pacific** | `--bg-page oklch(98.5% 0.005 230)` / `--bg-surface oklch(96.5% 0.008 230)` — never pure white. |
| Type | **Single-font Inter** | Weight and size carry hierarchy. A Fraunces display serif was trialled in Hallmark Phase 2 and **reverted by owner call (2026-07-12)** — do not reintroduce a display serif. |

## Macrostructure assignments (ADR 0002; machine copy in `.hallmark/log.json`)

| Page | Macrostructure |
|---|---|
| Home | Marquee Hero |
| About | Long Document |
| Governance | Stat-Led |
| Play | Workbench |
| Contact | Letter |
| Sponsors | Quote-Led |
| Pickup hub | Typographic List |
| Data & Research | Curated Index (typographic list) |

Anti-pattern floor for every page: not centred-everything · no 3-column feature grid ·
no eyebrow-on-every-section · no card-in-card.

## Privacy line (non-negotiable, data section)

Only PUBLIC and INTERNAL-aggregate figures ship. Never: OWNER-CODED or RESTRICTED material,
role-tied load figures (a committee role identifies a person in a ~56-member club), or
individual money. Spec §1/§3.3 govern; the T11 clearance table is the archive allowlist.
