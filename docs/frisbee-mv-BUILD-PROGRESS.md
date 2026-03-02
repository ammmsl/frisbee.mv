# frisbee.mv — Build Progress

**Last updated:** 2026-03-02  
**Stack:** Next.js 16 · React 19 · Tailwind CSS v4 · Supabase (plain Postgres) · Vercel (later)

> **Project approach:** Standalone repo. Not connected to the League Tracker. Develop locally first, push to git. Vercel deployment and domain setup are manual steps done later.

---

## Milestone Status

| Milestone | Name | Status |
|---|---|---|
| Pre-Dev | Checklist & Setup | ⬜ Not started |
| M1 | Shell & Global Layout | ⬜ Not started |
| M2 | Shared Component Library (Phase 1) | ⬜ Not started |
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

- [ ] New git repository initialised (`frisbee-mv`)
- [ ] Next.js 16 project created with TypeScript and Tailwind CSS v4 (`npx create-next-app@16`)
- [ ] Dependencies installed: `postgres`, `jose`, `bcryptjs`, `@types/bcryptjs`, `resend` (or `nodemailer`), `marked`
- [ ] Accent colour `#FF6B35` contrast ratios verified on white background (adjust shade if needed)
- [ ] Display font selected (Inter or DM Sans) — will be added via `next/font` in M1
- [ ] `.env.local` created with placeholder values for Phase 1 variables
- [ ] `public/documents/` directory created (AGM PDFs added when available — placeholder is fine)
- [ ] `config/` directory created with placeholder JSON files in place
- [ ] `next.config.ts` updated with Google Photos remote patterns (for Phase 2 images — add now to avoid later pain)
- [ ] Initial commit pushed to git

---

## M1 — Shell & Global Layout

**Goal:** Visual shell and layout infrastructure that every subsequent page depends on. Nothing renders until this is done.

### Tasks
- [ ] CSS custom property tokens in `app/globals.css` — accent, bg, surface, text, border tokens
- [ ] Tailwind v4 configured to reference CSS tokens
- [ ] Display font via `next/font` in `app/layout.tsx`
- [ ] `app/(site)/layout.tsx` — light theme scope, mounts SiteNav + SiteFooter
- [ ] `app/_components/SkipLink.tsx` — visually hidden, visible on focus, targets `#main-content`
- [ ] SkipLink mounted as first child in `app/layout.tsx`
- [ ] `app/_components/SiteFooter.tsx` — 4-col desktop / stacked mobile, registration statement, dynamic copyright, social links (icon + label), WFDF/AOFDF logos
- [ ] `app/_components/SiteNav.tsx` — sticky, solid background, all nav links, active state via `usePathname()`, WFDF/AOFDF badges desktop right zone
- [ ] Dropdown Menu for Play sub-navigation (Join a Session → `/play`, Rules → `/play/rules`)
- [ ] `app/_components/Drawer.tsx` — mobile full-screen overlay, hamburger trigger (44×44px), focus trap, Escape/backdrop close, CSS transition only, social + logos at bottom
- [ ] `app/layout.tsx` root — metadata defaults, font variable, SkipLink mounted, `<main id="main-content">` wrapper

### Exit Criteria
- [ ] `npm run dev` runs without errors
- [ ] Shell (nav + footer) renders on `localhost:3000`
- [ ] SiteNav is sticky; active state highlights current route
- [ ] Drawer opens/closes on mobile viewport; focus trap works (Tab cycles within drawer while open)
- [ ] SiteFooter shows: registration statement, dynamic year, social links with labels
- [ ] SkipLink visible on Tab keypress from blank page

---

## M2 — Shared Component Library (Phase 1)

**Goal:** All Phase 1 primitive components built before any page work begins.

### Tasks
- [ ] `Button.tsx` — Primary (disc-orange), Secondary (outline), Ghost, Destructive; min 44px height; loading state (Spinner replaces label, disabled during load); icon+text support
- [ ] `Badge.tsx` — 7 variants: `wfdf`, `upcoming`, `past`, `cancelled`, `paid`, `unpaid`, `partial`; WCAG AA contrast verified on all backgrounds
- [ ] `Spinner.tsx` — small inline spinner for button loading states
- [ ] `Skeleton.tsx` — animated shimmer; accepts `className` for shape
- [ ] `Toast.tsx` — success/error/info; bottom-right desktop, bottom-centre mobile; auto-dismiss 4s + manual close; `role="status"` + `aria-live="polite"`
- [ ] `Accordion.tsx` — `<details>`/`<summary>` based (JS-optional); CSS grid height animation (`grid-template-rows: 0fr → 1fr`); all-independent expansion; min 44px trigger height
- [ ] `Table.tsx` — semantic `<table>`, `<thead>`, `<th scope="col">`; responsive horizontal scroll wrapper; zebra striping prop
- [ ] `FileDownloadLink.tsx` — PDF icon + name + optional size; `target="_blank"` + `rel="noopener noreferrer"`; required `aria-label` prop
- [ ] `Avatar.tsx` — photo or initials fallback in accent palette circle
- [ ] `PersonCard.tsx` — Avatar + Name + Title + Term + bio (3-line CSS truncation); consistent height
- [ ] `QuoteBlock.tsx` — `<blockquote>`; large accent left border; slightly larger font
- [ ] `StatTile.tsx` — Client Component; `IntersectionObserver` scroll trigger; `requestAnimationFrame` counter 0→target ~1.5s ease-out; large number + label + optional icon
- [ ] `SearchInput.tsx` — `type="search"`; min 44px height; clear (×) button when value present; `onChange` callback
- [ ] `SegmentedControl.tsx` — 2–4 options as button group; single selection; filled/outline states
- [ ] `Modal.tsx` — `role="dialog"`, `aria-modal`, `aria-labelledby`; focus trap; Escape closes; backdrop-click configurable (off for destructive confirms); scale+fade CSS animation

### Exit Criteria
- [ ] All 15 components render in isolation without errors
- [ ] All interactive components keyboard accessible (Tab, Enter/Space, Escape)
- [ ] Touch targets ≥ 44px on all interactive elements
- [ ] Accordion works with JavaScript disabled (test in browser devtools)
- [ ] Badge contrast ratios pass WCAG AA (spot-check `paid`/green on white, `wfdf`/orange on white)

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
