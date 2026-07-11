# frisbee.mv — Hallmark Audit Remediation Plan

> **Working file.** This was written during plan mode at the scratch path the harness assigned. On approval, move (or copy) to `docs/frisbee-mv-hallmark-remediation-plan-v1.0.md` to match existing doc-naming conventions.

---

## Context

A Hallmark audit on 2026-05-20 reviewed every public-facing surface of the site — `app/(site)/*` (10 pages), `app/pickup/*` (4 pages), `app/league/*` (16 pages), and the shared chrome (`SiteNav`, `SiteFooter`, `globals.css`, `league.css`). Finding count: **13 critical · 11 major · 5 minor**. Verdict: *reads as AI-generated*.

The two largest contributors to that verdict are (1) **structural sameness across the sub-pages** — every `(site)/*` page opens with an identical accent-band hero + centred h1 + centred tagline, so the five pages are colour-swaps of one template — and (2) **the canonical AI nav + AI footer + single-font + pure-white-paper stack** in the shared chrome.

The intended outcome: federation pages read as institutional and considered (not as a SaaS landing template); the league sub-site stays a deliberately distinct sub-product with an honest visual handoff; correctness bugs (a hard-rule violation, a CSS scope leak, a missing reduced-motion guard) are fixed regardless.

---

## Decisions captured during the grilling session

| Decision | Choice | Reason |
|---|---|---|
| Ambition | Full remediation — 29 findings | User accepted macrostructure redesign as part of scope |
| League sub-site | Stays distinct + visual bridge | Green-on-dark is a deliberate sub-product identity; bridge with breadcrumb + signalled nav link |
| Federation chrome | **N6 Newspaper Masthead + Ft5 Statement** | Federation reads as institution, not SaaS; matches editorial genre |
| Display font | **Fraunces** — hero h1 + section h2 | Variable serif, SOFT axis, free Google Font; pairs with Inter body |
| Per-page macros | Accept proposed assignments (see below) | One macrostructure per page; no two `(site)/*` pages share a shape |
| Phasing | **Three phases**: bugs → chrome → macros | Each phase shippable on its own; user can stop after any phase and still be better off |
| Home stats | Verify-once snapshot with dated comment | Reuse `pickup/payments/_lib/sheets.ts` machinery for the verification query |

### Per-page macrostructure assignments

| Page | Macrostructure | Voice |
|---|---|---|
| Home (`app/(site)/page.tsx`) | **Marquee Hero** | Left-biased headline; asymmetric next-session / stats / news grid; not full-viewport-centred |
| About (`app/(site)/about/page.tsx`) | **Long Document** | Story-led single column; chapter rhythm; the Timeline becomes the spine |
| Governance (`app/(site)/governance/page.tsx`) | **Stat-Led** | Anchors: board count · committee count · documents · year founded · membership status |
| Play (`app/(site)/play/page.tsx`) | **Workbench** | Utility-first: next session top, schedule + FAQ + rules below; useful before pretty |
| Contact (`app/(site)/contact/page.tsx`) | **Letter** | Single block of prose; address right-aligned; no SaaS contact-form-on-left/info-on-right grid |
| Sponsors (`app/(site)/sponsors/page.tsx`) | **Quote-Led** | Tier-up sponsor cards with hairline rules between; "Become a sponsor" close where empty |
| Pickup hub (`app/pickup/page.tsx`) | Typographic list | `<dl>` of tools, not 2-column rounded-card grid |

---

## Implementation decisions baked into the plan (no separate question needed)

These are smaller calls I'm locking in at sensible defaults so the plan is executable without another round-trip. Reverse any of these at execution time with a one-line change.

- **Paper tint**: pacific-blue-cool, `oklch(98.5% 0.005 230)` ≈ `#f9fbfc`. Tint surface (`--bg-surface`) one shade deeper.
- **Icon library**: keep the hand-drawn inline-SVG voice. Replace `lucide-react`'s Menu/X in `app/league/_components/PublicNav.tsx` with two custom 6-line SVGs that match the federation site's stroke weight. Remove the `lucide-react` dependency.
- **Reduced-motion**: single global guard at the bottom of `globals.css` (zeroes animation/transition durations for `prefers-reduced-motion: reduce`). League inherits because `league.css` doesn't re-import Tailwind or override base.
- **`:root` scope leak fix**: rename the `:root { ... }` block in `app/league/league.css` (L8–L41) to `.league-root { ... }`. The class already exists at L45 and is applied by `app/league/layout.tsx`.
- **League-Federation bridge**:
  - In `SiteNav.tsx`: the "League" nav link gets a small green dot inline (`bg-green-400 w-1.5 h-1.5 rounded-full`) signalling sub-product crossover; opens in same tab (no `target="_blank"`).
  - In `app/league/_components/PublicNav.tsx`: prepend a small "← frisbee.mv" link to the topbar, left of the wordmark.
- **Hardcoded values to lift into tokens**:
  - `#86efac` in `league.css:325` → `--accent-hover-light`
  - `#1e1b4b` in `globals.css:256-258` → `--swap-selected` (define both bg + border with one token; drop `!important` by raising specificity)
  - `text-purple-600` in `app/(site)/page.tsx:303` → `--note-special` (CSS var, applied via inline style or a utility)
  - `#498EAD` in `app/(site)/page.tsx:193` — drop the 3-stop gradient entirely; collapse to solid `var(--accent-dark)` as carousel fallback.

---

## Phase 1 — Correctness bugs (target: 1 day, single PR)

These are bug-shaped, not aesthetic. Ship them first to clear the floor before chrome and macros.

| # | Finding | File | Fix |
|---|---|---|---|
| 4 | Bare `<img>` violates project hard rule | [app/league/_components/PublicNav.tsx:30](app/league/_components/PublicNav.tsx#L30) | Replace with Next `<Image src="/bannerlogo.svg" alt="UFA League" width={120} height={40} priority />` (mirror the pattern at [SiteNav.tsx:129-137](app/_components/SiteNav.tsx#L129-L137)) |
| 9 | `:root` scope leak — league.css tokens land globally | [app/league/league.css:8](app/league/league.css#L8) | Rename `:root {` to `.league-root {`. Verify on `/league/standings` → `/about` navigation that federation pacific-blue tokens are still present. |
| 12 | Stale `text-orange-100` from pre-rebrand | [app/(site)/contact/page.tsx:32](app/(site)/contact/page.tsx#L32) | Replace with `text-white/85` |
| 18 | Hard-coded hex / `!important` | `league.css:325`, `globals.css:256-258`, `(site)/page.tsx:303` | Lift each into a named CSS variable in the appropriate token block; drop `!important` |
| 19 | No `prefers-reduced-motion` global guard | `app/globals.css` (append) | Add: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }` |
| 20 | `transition-all` on nav shell | [app/_components/SiteNav.tsx:121](app/_components/SiteNav.tsx#L121) | Replace with explicit list: `transition: background-color 300ms var(--ease-default), border-color 300ms var(--ease-default), box-shadow 300ms var(--ease-default)` — no `outline` in the list (focus rings appear instantly) |
| 8 | Verify the 3,481 attendances stat | [app/(site)/page.tsx:272](app/(site)/page.tsx#L272) | Reuse `app/pickup/payments/_lib/sheets.ts` to fetch the live attendance count; commit the verified number with a dated comment: `// 3,481+ attendances as of YYYY-MM-DD — source: PivotAttendance`. Refresh quarterly. |
| 22 | `-9999px` offscreen technique | [app/globals.css:264](app/globals.css#L264) | Replace with `clip-path: inset(100%); position: fixed; opacity: 0; pointer-events: none` |
| 25 | Decorative accent-square thumbnail placeholders | [app/(site)/page.tsx:386-394](app/(site)/page.tsx#L386-L394) | Replace with a hairline-bordered figure carrying a typographic placeholder "Cover image — pending" |

**Verification (Phase 1):**
- `pnpm typecheck && pnpm build` — passes with no warnings.
- Manually navigate `/` → `/league` → `/league/standings` → `/about` → confirm federation pages render in pacific-blue, league pages in green; no token bleed.
- Toggle OS reduced-motion preference and confirm the draft-tool shuffle no longer strobes, drawer no longer animates.
- Run Lighthouse on `/league/page` — bare `<img>` warning is gone.
- Confirm contact page hero subtitle is white-tinted, not cream.

---

## Phase 2 — Chrome rebuild (target: 2–3 days, single PR or two)

The visible "this site changed" moment. Each change below lands on every page; do them as one merge.

### 2a. Add Fraunces

- Update `app/layout.tsx` to load Fraunces alongside Inter via `next/font/google`. Variable axes: `wght 400..900, opsz, SOFT, ital`.
- Expose via CSS variable: `--font-fraunces`.
- Add to `@theme` in `app/globals.css` so Tailwind picks it up as `font-display`.
- Usage discipline: Fraunces only on `<h1>` (hero) and major section `<h2>`. `<h3>` and below stay Inter. Encode this in a comment at the top of `globals.css`.

### 2b. Tint the paper

- Update `--color-bg-page` and `--bg-page` to `oklch(98.5% 0.005 230)` (≈ `#f9fbfc`).
- Update `--color-bg-surface` and `--bg-surface` to `oklch(96.5% 0.008 230)` (≈ `#eef3f5`).
- Spot-check contrast: Inter body on tinted paper still ≥ 4.5:1 (existing `--text-primary` `#111827` against the new bg is ~16:1, well clear).

### 2c. Rebuild `SiteNav` as N6 Newspaper Masthead

- New file: `app/_components/SiteNav.tsx` (full rewrite — keep the file name).
- Structure: centred wordmark over a thin pacific-blue rule (`border-bottom: 1px solid var(--accent)`), nav links in a row beneath, no sticky white card, no shadow. On scroll, the masthead doesn't transform — it scrolls off.
- Mobile: hamburger right-anchored under the rule. Drawer pattern from existing `Drawer.tsx` is reused.
- Home page no longer needs the `transparent-on-hero → solid-on-scroll` choreography. Delete the `#hero-sentinel` element from `app/(site)/page.tsx` and the scroll handler from the new nav.
- "League" link styled with the small green dot signalling crossover.
- Verify: `pnpm dev`, browse `/`, `/about`, `/governance`, `/play`, `/sponsors`, `/contact`, `/news` — masthead is identical across all, centred, no white card.

### 2d. Rebuild `SiteFooter` as Ft5 Statement

- Full rewrite of `app/_components/SiteFooter.tsx`.
- Drop the 4-column grid. One short paragraph (the statement), one inline row of links, one line of contact, no social-icon strip in the footer (move social to a single line inside the statement: *"…follow us on Instagram and TikTok at @frisbee.mv."*). No tiny copyright tail — the statement is the close.
- Verify: footer reads top-to-bottom as one declarative paragraph, no four columns.

### 2e. League sub-site visual bridge

- `app/league/_components/PublicNav.tsx`: add `← frisbee.mv` link left of the wordmark (small, `text-xs text-gray-500`).
- Remove `lucide-react` import; replace `Menu` and `X` icons with custom SVGs (8 lines each).
- `package.json`: remove `lucide-react` from dependencies; run `pnpm install` to update lockfile.
- Verify: `/league` topbar shows the back-link; no `lucide-react` in `node_modules`.

### 2f. Drop the home full-viewport hero (transitional)

- This is a partial Phase 3 deliverable, but it falls out naturally from removing the `#hero-sentinel` in 2c. Replace the `min-h-screen flex items-center justify-center` hero with a content-height left-biased block. The full Marquee Hero treatment lands in Phase 3a.

**Verification (Phase 2):**
- `pnpm build` and visual diff every public page side-by-side with pre-merge.
- Confirm no page on `(site)/*` still uses the `bg-[var(--accent)] py-16 px-4` centred hero band (that lives until Phase 3).
- WCAG AA contrast pass on tinted paper.
- League sub-site renders in its own green palette with the bridge link, no token bleed.

---

## Phase 3 — Per-page macros (one PR per page)

Each page gets its own PR so review stays focused. Order recommendation: Home first (most-visited), then in the order the user mentioned each in conversation. Each PR is allowed to introduce new co-located components (e.g. `app/(site)/about/Chapter.tsx`) but should not add abstractions for hypothetical future use.

| Order | Page | Macrostructure | Key shape notes |
|---|---|---|---|
| 3a | Home (`app/(site)/page.tsx`) | Marquee Hero | Left-biased headline in Fraunces; right column carries the next-session card. Stats bar becomes a typographic row with thin rules between (no card chrome). News row keeps the horizontal-scroll-on-mobile pattern. |
| 3b | About | Long Document | Drop the accent-band hero. Open with the headline at top-left + a wide left margin. Mission becomes the opening paragraph. Timeline becomes the spine — single column, full-bleed at desktop. "Where We Play" → an inline `<dl>` with city names as `<dt>`s, not three equal cards. |
| 3c | Governance | Stat-Led | Open with five anchored numerals (board count · committee count · AGM document count · year founded · provisional-member-since). Each anchored to a section deeper in the page. Board grid keeps the `PersonCard` component but with vary-sized spans (the President spans 2 columns; committee chairs span 1). |
| 3d | Play | Workbench | Drop the accent-band hero. Open with the next session top — date + location + map + Instagram CTA in a left-biased block. Schedule table beneath it, then FAQ accordion, then a link to `/play/rules` as a typographic close, not a CTA. |
| 3e | Contact | Letter | Single column, narrow measure (`max-w-prose`). Replace the form-left / info-right grid with a one-block letter: greeting, prose explaining what we respond to, then the form embedded inline; address as a `<address>` block right-aligned beneath. |
| 3f | Sponsors | Quote-Led | Each sponsor card becomes a quote (the `description` field as a pull-quote), sponsor name as attribution. Hairline rules between tiers. Empty-state copy: *"We're looking for our first title sponsor. Get in touch."* — link to `/contact`. Drop the 3-column grid. |
| 3g | Pickup hub (`app/pickup/page.tsx`) | Typographic list | `<dl>` of three tools — name as `<dt>` (Inter semibold), description + "Open →" link as `<dd>`. No rounded-card chrome. |

**Per-page verification:**
- Each PR is checked against the Hallmark anti-pattern list — at minimum: not centred-everything, not 3-column-feature-grid, not eyebrow-on-every-section, not card-in-card.
- Each PR stamps the page CSS or top-of-file with `/* Hallmark · macrostructure: <name> · theme: federation · paper: tinted-pacific · accent: pacific-blue */` so future audits know what shape was chosen.
- Each PR removes any now-orphaned tokens or utilities from the previous design.

---

## Files to modify (master list)

**Phase 1:**
- `app/league/_components/PublicNav.tsx` — bare img → Next/Image
- `app/league/league.css` — `:root` → `.league-root`; lift `#86efac` to token
- `app/(site)/contact/page.tsx` — orange-100 → white/85
- `app/globals.css` — reduced-motion guard; lift `#1e1b4b`; drop `-9999px`
- `app/(site)/page.tsx` — verify 3481, lift `text-purple-600`, drop tinted thumbnails
- `app/_components/SiteNav.tsx` — transition-all → explicit list

**Phase 2:**
- `app/layout.tsx` — add Fraunces via next/font
- `app/globals.css` — tint paper; add `--font-fraunces`; expand `@theme`
- `app/_components/SiteNav.tsx` — full rewrite (N6)
- `app/_components/SiteFooter.tsx` — full rewrite (Ft5)
- `app/(site)/page.tsx` — remove `#hero-sentinel`, transitional hero
- `app/league/_components/PublicNav.tsx` — back-link, custom Menu/X SVGs
- `package.json`, `pnpm-lock.yaml` — drop `lucide-react`

**Phase 3:**
- `app/(site)/page.tsx` — Marquee Hero
- `app/(site)/about/page.tsx` + `Timeline.tsx` — Long Document
- `app/(site)/governance/page.tsx` — Stat-Led; reuse `PersonCard.tsx`, `QuoteBlock.tsx`, `FileDownloadLink.tsx`
- `app/(site)/play/page.tsx` — Workbench; reuse `Accordion.tsx`
- `app/(site)/contact/page.tsx` + `ContactForm.tsx` — Letter
- `app/(site)/sponsors/page.tsx` — Quote-Led
- `app/pickup/page.tsx` — typographic list

---

## Reuse existing utilities (no new abstractions)

Before writing new components, prefer these existing ones:

- `lib/session.ts` — MVT-aware next session helpers (`getNextSession`, `getConsecutiveWeeks`)
- `lib/events.ts` — published posts + session overrides
- `lib/sheets.ts` — Google Sheets fetch (also `app/pickup/payments/_lib/sheets.ts` for the attendance pivot)
- `app/_components/StatTile.tsx` — IntersectionObserver-driven counter
- `app/_components/Accordion.tsx` — native `<details>/<summary>` accordion
- `app/_components/PersonCard.tsx`, `QuoteBlock.tsx`, `FileDownloadLink.tsx`, `Badge.tsx`, `Avatar.tsx`
- `app/_components/Drawer.tsx` — mobile drawer with focus trap (keep for the new nav)
- Existing brand tokens in `globals.css` — extend, don't redeclare

Do not introduce a new design-token library, motion library (no framer-motion), or rich-text editor.

---

## End-to-end verification

After all three phases:

1. **Build & type-check** — `pnpm typecheck && pnpm build` clean, no new warnings.
2. **Visual sweep at 320 / 375 / 414 / 768 / 1024 / 1440 px** — every `(site)/*` page, every `pickup/*` page, every `league/*` page renders without horizontal scroll, without two-line clickable text, without text overflow on the new chrome.
3. **Re-run a Hallmark audit on the branch** — verdict should flip from *reads as AI-generated* to *close, fix the minors* or better. Confirm zero critical findings, no more than 2 majors.
4. **Reduced-motion test** — OS toggle on, draft-tool shuffle finite, drawer instant, no infinite animations.
5. **Cross-route navigation test** — `/` → `/about` → `/league` → `/league/standings` → `/contact` — colour tokens stay scoped, no green bleed into federation pages.
6. **Lighthouse** — public pages still meet the LCP target (the `HeroCarousel` LCP image is unchanged; the masthead is lighter than the old sticky-white nav).
7. **Manual screenshot diff** of the home page against the audit-time snapshot — should be unmistakably different in structural fingerprint, not just colour-swapped.

---

## Followups (not for this plan; do at execution start)

1. **Write two ADRs** in `docs/adr/`:
   - `0001-league-as-distinct-visual-sub-product.md` — captures the green/blue split decision with a future-reader rationale (why the league isn't unified with the federation palette).
   - `0002-per-page-macrostructure-rotation.md` — captures the no-two-sub-pages-share-a-shape rule so future page additions follow the same discipline.
2. **Create `CONTEXT.md`** at project root with the federation-vs-league terminology, the macrostructure assignments table, and the chrome archetype IDs. This is the project's glossary going forward.
3. **Update `CLAUDE.md`** — add a "Design system" section pointing at the chosen chrome archetypes and the macrostructure assignment table.
4. **Update `MEMORY.md`** — record the chrome rebuild, Fraunces addition, paper tint, and `:root` scope-leak fix.
5. **Initialize `.hallmark/log.json`** at project root with the per-page macrostructure picks so future Hallmark runs respect the diversification rule.
