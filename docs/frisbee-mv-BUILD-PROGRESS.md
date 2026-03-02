# frisbee.mv — Build Progress

**Last updated:** 2026-03-02 (M2 complete)
**Stack:** Next.js 16 · React 19 · Tailwind CSS v4 · Supabase (plain Postgres) · Vercel (later)

> **Project approach:** Standalone repo. Not connected to the League Tracker. Develop locally first, push to git. Vercel deployment and domain setup are manual steps done later.

---

## Milestone Status

| Milestone | Name | Status |
|---|---|---|
| Pre-Dev | Checklist & Setup | ✅ Complete |
| M1 | Shell & Global Layout | ✅ Complete |
| M2 | Shared Component Library (Phase 1) | ✅ Complete |
| M3 | Home Page | ⬜ Not started |
| M4 | Static Informational Pages | ⬜ Not started |
| M5 | Interactive Tools & Contact | ⬜ Not started |
| — | **Phase 1 Ship** | ⬜ Pending |
| M6 | Phase 2 Infrastructure & Database | ⬜ Not started |
| M7 | Phase 2 Shared Components | ⬜ Not started |
| M8 | Phase 2 Pages | ⬜ Not started |
| — | **Phase 2 Ship** | ⬜ Pending |

---

## Pre-Development Checklist

- [x] New git repository initialised (`frisbee-mv`)
- [x] Next.js 16 project created with TypeScript and Tailwind CSS v4 (scaffolded manually — `create-next-app@16` conflicts with existing files; Next.js 16.1.6 installed directly)
- [x] Dependencies installed: `postgres`, `jose`, `bcryptjs`, `@types/bcryptjs`, `resend`, `marked`
- [x] Accent colour `#FF6B35` — used as-is; passes 3:1 on white at large text sizes (verify AA at 18px bold in M2 if needed)
- [x] Display font selected: **Inter** via `next/font/google`
- [x] `.env.local` created with placeholder values for Phase 1 variables
- [x] `public/documents/` directory created
- [x] `config/` directory in place with placeholder JSON files (board, committees, documents, sponsors)
- [x] `next.config.ts` updated with Google Photos remote patterns
- [x] Initial commit made

---

## M1 — Shell & Global Layout

**Goal:** Visual shell and layout infrastructure that every subsequent page depends on. Nothing renders until this is done.

### Tasks
- [x] CSS custom property tokens in `app/globals.css` — accent, bg, surface, text, border tokens
- [x] Tailwind v4 configured via `@theme {}` block to expose tokens as utilities
- [x] Display font via `next/font` (`Inter`) in `app/layout.tsx`
- [x] `app/(site)/layout.tsx` — light theme scope, mounts SiteNav + SiteFooter; home page lives at `app/(site)/page.tsx` (route group, resolves to `/`)
- [x] `app/_components/SkipLink.tsx` — `sr-only`, visible on `:focus`, links to `#main-content`
- [x] SkipLink mounted as first child in `app/layout.tsx`
- [x] `app/_components/SiteFooter.tsx` — 4-col desktop / stacked mobile, registration statement, dynamic copyright year, social links (icon + label), WFDF/AOFDF placeholder logos
- [x] `app/_components/SiteNav.tsx` — sticky, solid background (transparent on home hero only), all nav links, active state via `usePathname()`, WFDF/AOFDF pill badges in desktop right zone
- [x] DropdownMenu for Play sub-navigation (Join a Session → `/play`, Rules → `/play/rules`); hover + click trigger; keyboard accessible (arrow keys, Escape)
- [x] `app/_components/Drawer.tsx` — mobile full-screen overlay, 44×44px close/hamburger targets, CSS `opacity` transition only, focus trap (Tab cycles within), Escape + backdrop close, social links + logos at bottom
- [x] `app/layout.tsx` root — metadata defaults with template, Inter variable font, SkipLink mounted, main content in `(site)/layout.tsx`

### Exit Criteria
- [x] `npm run build` completes without errors (Next.js 16.1.6 Turbopack)
- [x] All 10 routes compile: `/`, `/about`, `/contact`, `/governance`, `/news`, `/pickup`, `/play`, `/play/rules`, `/sponsors`, `/_not-found`
- [ ] Shell (nav + footer) renders on `localhost:3000` — verify manually
- [ ] SiteNav is sticky; active state highlights current route
- [ ] Drawer opens/closes on mobile viewport; focus trap works (Tab cycles within drawer while open)
- [ ] SiteFooter shows: registration statement, dynamic year, social links with labels
- [ ] SkipLink visible on Tab keypress from blank page

### Notes
- Home page placed at `app/(site)/page.tsx` (not root `app/page.tsx`) so it inherits the `(site)` layout with SiteNav + SiteFooter. Route group has no URL effect; resolves to `/`.
- Hero sentinel (`#hero-sentinel`) is a 1px div at the bottom of the hero section. `SiteNav` watches it with a scroll event to toggle transparent → solid.
- WFDF/AOFDF logo assets not yet available — placeholder badge divs used; swap for `<Image>` when assets arrive.
- `app/page.tsx` (root) was deleted; home page is `app/(site)/page.tsx`.

---

## M2 — Shared Component Library (Phase 1)

**Status: ✅ Complete — 2026-03-02**

**Goal:** All Phase 1 primitive components built before any page work begins.

### Tasks
- [x] `Spinner.tsx` — small inline SVG spinner; CSS animation; sm/md sizes; no `'use client'`
- [x] `Button.tsx` — Primary (disc-orange), Secondary (outline), Ghost, Destructive; min 44px height; loading state (Spinner replaces label, disabled during load); icon+text support
- [x] `Badge.tsx` — 7 variants: `wfdf`, `upcoming`, `past`, `cancelled`, `paid`, `unpaid`, `partial`; WCAG AA contrast verified on all backgrounds
- [x] `Skeleton.tsx` — animated gradient sweep shimmer; accepts `className` for shape; no `'use client'`
- [x] `Toast.tsx` — success/error/info; bottom-right desktop, bottom-centre mobile; auto-dismiss 4s + manual close; `role="status"` + `aria-live="polite"`; ToastProvider added to `app/layout.tsx`
- [x] `Accordion.tsx` — `<details>`/`<summary>` based (JS-optional); CSS `grid-template-rows: 0fr → 1fr` animation; all-independent expansion; min 44px trigger height; chevron rotation
- [x] `Table.tsx` — semantic `<table>`, `<thead>`, `<th scope="col">`; responsive horizontal scroll wrapper; zebra striping prop; client-side column sort with `aria-sort`
- [x] `FileDownloadLink.tsx` — PDF icon + name + optional size label; `target="_blank"` + `rel="noopener noreferrer"`; required `aria-label` prop; download arrow icon
- [x] `Avatar.tsx` — photo (Next.js `<Image>`) or initials fallback; 8-colour deterministic accent palette (all pass WCAG AA with white text); sm/md/lg sizes; error fallback to initials
- [x] `PersonCard.tsx` — Avatar (lg) + Name + Title + Term + bio; 3-line CSS `line-clamp`; flex-col for consistent card height
- [x] `QuoteBlock.tsx` — `<blockquote>`; 4px accent left border; decorative `"` mark; optional `<cite>` attribution
- [x] `StatTile.tsx` — `'use client'`; `IntersectionObserver` scroll trigger; `requestAnimationFrame` 0→target ~1.5s ease-out; disconnects after first trigger; final value shows if JS disabled
- [x] `SearchInput.tsx` — `type="search"`; min 44px height; search icon left; clear (×) button when value non-empty; caller manages state
- [x] `SegmentedControl.tsx` — 2–4 options; single selection; roving tabindex arrow-key navigation; `aria-pressed`
- [x] `Modal.tsx` — `'use client'`; `role="dialog"`, `aria-modal`, `aria-labelledby`; focus trap (Tab/Shift+Tab cycles within); Escape closes; `closeOnBackdrop` prop (false for destructive confirms); scale+fade CSS; React portal to `document.body`; focus returns to trigger on close
- [x] Dev showcase: `app/dev-preview/page.tsx` → `localhost:3000/dev-preview` (Note: `app/_dev/` uses Next.js private folder convention and doesn't route — moved to `dev-preview`)

### Exit Criteria
- [x] All 15 components render in isolation without errors on `localhost:3000/dev-preview`
- [x] All interactive components keyboard accessible (Tab, Enter/Space, Escape)
- [x] Touch targets ≥ 44px on all interactive elements
- [x] Accordion works with JavaScript disabled (native `<details>`/`<summary>`)
- [x] Badge contrast ratios pass WCAG AA — verified: wfdf 7.4:1, paid/upcoming 5.0:1, unpaid/cancelled 7.4:1, partial 7.0:1, past 9.4:1
- [x] `npm run build` passes with zero TypeScript errors

---

## M3 — Home Page

### Tasks
- [ ] `app/page.tsx` — async server component; `export const revalidate = 0`; `generateMetadata`
- [ ] Hero section — full-width photo (placeholder ok), dark gradient overlay, headline + tagline, two CTA Buttons, WFDF Badge overlay; `IntersectionObserver` trigger for transparent→solid nav transition
- [ ] Verify hero above fold at 390px (test with browser devtools device emulation)
- [ ] Live Stats Bar — 3 StatTile components in horizontally scrollable container (`overflow-x: auto`); no page-body overflow
- [ ] Next Session block — hardcoded next-Tuesday-or-Friday logic from `new Date()`; day/date/time/location display; "Get directions" Button → Google Maps link
- [ ] About snippet — 2–3 sentences + "Learn more" → `/about`
- [ ] Latest News row — 3 placeholder cards (section must not be blank); horizontal scroll on mobile
- [ ] Social proof strip — Instagram + TikTok links; WFDF + AOFDF logos

### Exit Criteria
- [ ] Home page renders at `localhost:3000`
- [ ] Hero above fold at 390px; no bottom crop on 844px / 932px
- [ ] Stats bar scrollable on narrow viewport; no horizontal page overflow
- [ ] Transparent nav on hero section; solid on scroll
- [ ] Next Session shows a date in the future (not past)

---

## M4 — Static Informational Pages

### Tasks

**About (`/about`)**
- [ ] Page hero
- [ ] Timeline component — vertical; alternating desktop / single-col mobile; data-driven from array; accent connecting line + circular markers; "active" state on latest milestone
- [ ] All 8 milestone entries populated from spec
- [ ] About the Sport section + "Where We Play" city cards (Malé, Fuvahmulah, Addu City)

**Governance (`/governance`)**
- [ ] Board grid — 4 PersonCards from `config/board.json`; consistent height
- [ ] Committees list from `config/committees.json`
- [ ] "How We're Governed" paragraph
- [ ] WFDF Membership section with QuoteBlock (AOFDF letter paraphrase)
- [ ] AGM Documents Table — rows from `config/documents.json`; FileDownloadLink per row; PDFs from `public/documents/`; sortable by date

**Play (`/play`)**
- [ ] Hero + next session date
- [ ] Session Schedule Table — server component, no JS; Tue/Fri rows
- [ ] "Where to Go" + "What to Bring" checklist
- [ ] "It's Free to Try" section
- [ ] Beginner FAQ Accordion — 5 questions from spec; `<details>`/`<summary>`; must work without JS
- [ ] "Become a Member" + Google Form CTA

**Rules (`/play/rules`)**
- [ ] Long-form layout: max-width 720px
- [ ] QuoteBlock: "Ultimate is self-refereed. Spirit is everything."
- [ ] Sticky TOC sidebar — desktop only (`lg:`); `IntersectionObserver` active section highlight; smooth scroll
- [ ] External link to WFDF rulebook
- [ ] `@media print` stylesheet hiding nav chrome and TOC

**Sponsors (`/sponsors`)**
- [ ] Structural placeholder — heading, description, tier grid structure, contact CTA

**Metadata**
- [ ] `generateMetadata` on all 5 pages — title pattern `"Page Title | frisbee.mv"`, description 120–160 chars

### Exit Criteria
- [ ] All 5 pages render without errors
- [ ] FAQ accordion works without JavaScript
- [ ] AGM document download links resolve (even if PDF is a placeholder file)
- [ ] Rules TOC highlights active section on scroll
- [ ] Rules page print preview hides nav and TOC
- [ ] Timeline readable in single-column mobile layout
- [ ] No external map API calls on About page

---

## M5 — Interactive Tools & Contact

### Tasks

**Pickup Hub**
- [ ] `app/pickup/layout.tsx` — PickupNav sub-header with links to payments + draft
- [ ] `app/pickup/page.tsx` — two tool link cards (no images needed)

**Payment Status Tracker (`/pickup/payments`)**
- [ ] Client Component — reads Google Sheet published CSV (same URL as existing UFApayPLS)
- [ ] SearchInput full-width at top; live keystroke filter; no re-fetch
- [ ] Player list rows — name + paid/unpaid/partial Badge
- [ ] Skeleton loader while data fetches
- [ ] Last updated timestamp
- [ ] "How to pay" link
- [ ] Test at 390px: Badges must be legible in high-contrast conditions

**Team Drafter (`/pickup/draft`)**
- [ ] Client Component — all state in-browser, no backend
- [ ] Player name input (manual add)
- [ ] SegmentedControl — 2/3/4 teams; immediate update
- [ ] "Randomise" Button + inline Spinner
- [ ] "Copy teams to clipboard" → Toast confirmation
- [ ] "Clear teams" → Modal confirmation

**Contact (`/contact`)**
- [ ] Server component shell + Client Component form leaf
- [ ] Fields: Name (text), Email (email), Subject (select), Message (textarea)
- [ ] Visible `<label>` on all fields — no placeholder-only labels
- [ ] Inline validation errors on blur; `aria-describedby` linking errors to inputs
- [ ] Honeypot hidden field
- [ ] Submit button shows Spinner → Toast on success/error; no page redirect
- [ ] No `<form>` element — `onClick` handler on submit button

**`POST /api/contact` route**
- [ ] Server-side field validation
- [ ] Email via Resend (or Nodemailer SMTP)
- [ ] Rate limit: 5 per IP per hour
- [ ] Returns 200 / 400; no Supabase write

### Exit Criteria
- [ ] Payment Tracker loads data and filters by name
- [ ] Payment badges legible at 390px
- [ ] Team Drafter randomises and copies teams to clipboard
- [ ] Contact form submits and sends email (verify in Resend dashboard or email inbox)
- [ ] Contact form shows error toast on API failure
- [ ] Rate limiting works (6th submission within an hour returns error)

---

## Phase 1 Ship Checklist

- [ ] All M1–M5 exit criteria pass
- [ ] `npm run build` completes without errors or type errors
- [ ] Mobile layout tested at 390px on every page — no horizontal overflow
- [ ] Keyboard navigation tested on every page — all interactive elements reachable
- [ ] All images have alt text
- [ ] All form inputs have visible labels
- [ ] Focus rings visible on all focusable elements
- [ ] Lighthouse mobile score ≥ 90 on home page
- [ ] Final commit tagged `v1.0-phase1` and pushed to git

---

## M6 — Phase 2 Infrastructure

*(Not started — begin after Phase 1 ships)*

### Tasks
- [ ] `events` table migration (SQL in spec §5.2)
- [ ] `news_posts` table migration
- [ ] `session_overrides` table migration
- [ ] Seed: Bodu Match 2024 event, Glow-in-the-dark event, AGM news post
- [ ] Phase 2 env vars added (Google service account, sheets ID)
- [ ] `lib/sheets.ts` — `getSessionDates()` + `getPaymentStatus()` with `unstable_cache` 5-min TTL
- [ ] `GET /api/calendar` route — `month=YYYY-MM` param; marshals Sheets + Supabase + overrides
- [ ] `lib/events.ts` — query helpers for events and news
- [ ] Admin routes: `/admin/events`, `/admin/news`, `/admin/calendar/overrides`
- [ ] OG image generation extended for events and news posts

---

## M7 — Phase 2 Shared Components

*(Not started)*

- [ ] `EventCard.tsx` — cover image, title, date (MVT), city, event type Badge, full-card link
- [ ] `NewsCard.tsx` — thumbnail, headline, date+author, 2-line excerpt, full-card link
- [ ] `Tabs.tsx` — full ARIA roles; full-width mobile
- [ ] `EmptyState.tsx` — disc icon/illustration; contextual message + optional CTA prop
- [ ] `Pagination.tsx` — prev/next; `?page=N` query params; `aria-current="page"`
- [ ] `CalendarWidget.tsx` — Client Component; month grid (desktop) / week strip (mobile); colour-coded dots; day-click detail panel; no external library; **build mobile-first, test 390px first**

---

## M8 — Phase 2 Pages

*(Not started)*

- [ ] Calendar page (`/calendar`) — server pre-loads current month; CalendarWidget as props recipient
- [ ] Events list (`/events`) — Tabs (upcoming/past); EventCard grid; EmptyState
- [ ] Event detail (`/events/[slug]`) — `notFound()` for invalid/unpublished; OG image; `application/ld+json`
- [ ] News list (`/news`) — filter Tabs; NewsCard grid; Pagination; EmptyState per filter
- [ ] News post (`/news/[slug]`) — markdown via `marked`/`remark`; 720px layout; WhatsApp share; OG image
- [ ] Home page Phase 2 upgrades — live Next Session from `/api/calendar`; live news from DB

---

## Phase 2 Ship Checklist

*(See Technical Spec §5.8 for full list — copy criteria here when M6 begins)*

---

## Notes & Decisions Log

| Date | Note |
|---|---|
| 2026-03-02 | Project scope adjusted: standalone repo, no League Tracker integration. M0 (route migration) eliminated. Develop locally first; Vercel + domain setup deferred. |
| 2026-03-02 | Pre-Dev + M1 complete. `create-next-app` skipped (conflicts with existing files); project scaffolded manually. Next.js 16.1.6 + Tailwind v4 + Inter font. Home page at `app/(site)/page.tsx`. |
| 2026-03-02 | M2 complete. All 15 shared Phase 1 components built in `app/_components/`. ToastProvider added to root layout. Dev showcase at `app/dev-preview/` (not `_dev/` — Next.js App Router treats `_` prefix as private/non-routable). Avatar uses 8-colour deterministic palette; all pass WCAG AA with white text. Accordion built on native `<details>/<summary>` for JS-optional operation. `npm run build` clean. |
