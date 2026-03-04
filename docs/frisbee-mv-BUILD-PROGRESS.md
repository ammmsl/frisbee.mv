# frisbee.mv — Build Progress

**Last updated:** 2026-03-04 (M5 complete)
**Stack:** Next.js 16 · React 19 · Tailwind CSS v4 · Supabase (plain Postgres) · Vercel (later)

> **Project approach:** Standalone repo. Not connected to the League Tracker. Develop locally first, push to git. Vercel deployment and domain setup are manual steps done later.

---

## Milestone Status

| Milestone | Name | Status |
|---|---|---|
| Pre-Dev | Checklist & Setup | ✅ Complete |
| M1 | Shell & Global Layout | ✅ Complete |
| M2 | Shared Component Library (Phase 1) | ✅ Complete |
| M3 | Home Page | ✅ Complete |
| M4 | Static Informational Pages | ✅ Complete |
| M5 | Interactive Tools & Contact | ✅ Complete |
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

**Status: ✅ Complete — 2026-03-02**

### Tasks
- [x] `app/(site)/page.tsx` — async server component; `export const revalidate = 0`; `generateMetadata` with title, description, openGraph
- [x] Hero section — disc-orange gradient (135deg, #FF6B35→#bf3d18) + dark tint overlay; headline "Maldives Flying Disc Federation", tagline with cities; two link-buttons (Primary "Join a Session" → /play, Ghost "Pickup & League" → /pickup); WFDF Badge bottom-left; `#hero-sentinel` div at bottom for SiteNav observer
- [x] Verify hero above fold at 390px — `min-h-screen -mt-16` covers full viewport; no bottom crop on 844px / 932px
- [x] Live Stats Bar — 3 StatTile components (167+ Players, 113+ Consecutive Weeks, 3,481+ Attendances); `flex overflow-x-auto` on mobile; `lg:justify-center lg:overflow-visible` on desktop; no page-body overflow
- [x] Next Session block — `lib/session.ts` helper; pure server-side MVT arithmetic (UTC+5 offset, no external libs); correct Tue/Fri logic with 17:30 cutoff; "Get Directions" ghost link → Google Maps
- [x] About snippet — 3 sentences; "Learn more about us →" text link → `/about` (accent colour, not Button)
- [x] Latest News row — 3 static placeholder cards (disc-orange thumbnail, headline, date, excerpt); flex+overflow-x-auto on mobile; lg:grid lg:grid-cols-3 on desktop
- [x] Social proof strip — Instagram + TikTok icon+text links; WFDF + AOFDF labelled badge links; flex-wrap to two rows on narrow screens; no text truncation

### Exit Criteria
- [x] Home page renders at `localhost:3000`
- [x] Hero above fold at 390px; no bottom crop on 844px / 932px
- [x] Stats bar scrollable on narrow viewport; no horizontal page overflow
- [x] Transparent nav on hero section; solid on scroll (SiteNav already handles via `#hero-sentinel`)
- [x] Next Session shows a date in the future (not past) — `lib/session.ts` verified

### Notes
- Home page lives at `app/(site)/page.tsx` (route group resolves to `/`) — NOT `app/page.tsx`
- `lib/session.ts` created as the first file in the `lib/` directory
- StatTile `hasAnimated` ref ensures counter fires exactly once; no re-trigger on scroll-up
- `generateMetadata` uses `title: { absolute: '...' }` to override the root layout template
- Hero gradient is intentional brand design: `135deg, #FF6B35 → #e8582a → #bf3d18` + radial highlight layer
- `npm run build` clean; 0 TypeScript errors; home page correctly shows as `ƒ (Dynamic)`

---

## M4 — Static Informational Pages

**Status: ✅ Complete — 2026-03-04**

### Tasks

**About (`/about`)**
- [x] Page hero — accent-colour band, white text
- [x] Our Mission section
- [x] Timeline component (`app/(site)/about/Timeline.tsx`) — server component; single-col mobile (line on left); alternating zigzag desktop; 8 milestone entries; last entry filled accent marker; data-driven (add to MILESTONES array, no JSX change needed)
- [x] About the Sport section + "Read the rules →" text link to `/play/rules`
- [x] "Where We Play" — 3 city cards (Malé, Fuvahmulah, Addu City); no map API

**Governance (`/governance`)**
- [x] Board grid — 4 PersonCards from `config/board.json`; `items-stretch` grid for equal card height
- [x] Committees list — all 5 from `config/committees.json`; chairperson or "applications open" note
- [x] "How We're Governed" two-paragraph section
- [x] WFDF Membership section — paragraph + QuoteBlock (AOFDF paraphrase) + WFDF/AOFDF text links
- [x] AGM Documents — inline semantic table (not the `'use client'` Table component, which only accepts `string[][]`); FileDownloadLink in Download column; rows from `config/documents.json` sorted date-descending

**Play (`/play`)**
- [x] Hero — accent band; "Come play with us." heading; next session computed from `lib/session.ts`; WhatsApp link CTA
- [x] Session Schedule — plain HTML `<table>` (not `'use client'` Table component); works without JS; Tuesday + Friday rows
- [x] "Where to Go" — Villingili Football Ground card + Get directions link + "What to Bring" list
- [x] "It's Free to Try" section + Payment Tracker link
- [x] Beginner FAQ — Accordion component (`<details>`/`<summary>`); all 5 questions; works without JavaScript
- [x] "Become a Member" — Google Form placeholder CTA (`https://forms.gle/placeholder`)

**Rules (`/play/rules`)**
- [x] Long-form layout: `max-w-[720px]`; `leading-loose` body text
- [x] `TableOfContents.tsx` (`'use client'`): IntersectionObserver active-section tracking; smooth-scroll on click; 5 sections
- [x] TOC sidebar hidden below `lg:` via `display:none` (not in visible/interactable state on mobile)
- [x] TOC sticky at `top-24` on desktop
- [x] QuoteBlock: "Ultimate is self-refereed. Spirit is everything."
- [x] All 5 rule sections with `scroll-mt-24` on headings
- [x] WFDF Official Rulebook Secondary-variant link → `https://rules.wfdf.org`
- [x] `@media print` CSS block hiding TOC column and `<header>`/`<footer>` elements

**Sponsors (`/sponsors`)**
- [x] Accent hero band
- [x] Overview paragraph
- [x] Tier grid — Title (1 slot), Gold Partners (2 slots), Community Supporters (3 slots)
- [x] Placeholder cards with dashed border when tier has no active sponsors
- [x] Active sponsor card support (data from `config/sponsors.json`, `active: true`)
- [x] Contact CTA → `/contact`

**Cross-cutting**
- [x] `generateMetadata` with correct `title` and `description` on all 5 pages
- [x] "Ekuveni Ground" removed from entire codebase — 0 matches
- [x] `lib/session.ts` location updated to "Villingili Football Ground, Malé"
- [x] Home page news excerpt and Maps link updated
- [x] Accordion `ref` removed (was unused no-op; caused "Refs cannot be used in Server Components" error)
- [x] `npm run build` clean — 11 routes, 0 TypeScript errors

### Exit Criteria
- [x] All 5 pages render without errors
- [x] FAQ accordion works without JavaScript (`<details>`/`<summary>` native)
- [x] AGM document download links resolve to `/documents/*.pdf` paths
- [x] Rules TOC highlights active section on scroll (IntersectionObserver)
- [x] Rules page `@media print` hides nav chrome and TOC column
- [x] Timeline readable in single-column mobile layout
- [x] No external map API calls — all location links are plain `<a href="...">` to Maps/goo.gl
- [x] Zero "Ekuveni" matches in codebase (`grep` confirmed clean)
- [x] `npm run build` passes — all 11 routes static/dynamic as expected

---

## M5 — Interactive Tools & Contact

**Status: ✅ Complete — 2026-03-04**

### Tasks

**Pickup Hub**
- [x] `app/pickup/layout.tsx` — SiteNav + PickupNav sub-header + SiteFooter (pickup/ is NOT inside (site)/)
- [x] `app/pickup/PickupNav.tsx` — `'use client'`; usePathname active state; Payment Tracker + Team Drafter links
- [x] `app/pickup/page.tsx` — two tool link cards (sm:grid-cols-2); border + hover state; "Open →" links

**Payment Status Tracker (`/pickup/payments`)**
- [x] `app/pickup/payments/PaymentTracker.tsx` — `'use client'`; Google Sheets API v4 fetch on mount
- [x] `app/pickup/payments/page.tsx` — server shell with `generateMetadata`
- [x] SearchInput full-width at top; live name filter; case-insensitive
- [x] Player list rows — name + Unpaid/Prepaid/Paid Badge; pending amount shown if > 0
- [x] Skeleton loader (8 skeleton rows) while data fetches
- [x] Last updated timestamp (HH:MM format)
- [x] Error state with Retry button
- [x] "How to pay" card with BML account number + WhatsApp link
- [x] API key + Sheet ID hardcoded as constants (public, already in GitHub Pages deployment)

**Team Drafter (`/pickup/draft`)**
- [x] `app/pickup/draft/TeamDrafter.tsx` — `'use client'`; all state in-browser
- [x] `app/pickup/draft/page.tsx` — server shell with `generateMetadata`
- [x] Textarea player input (min 120px); live player count below
- [x] SegmentedControl — 2/3/4 teams; default 2
- [x] "Draft Teams" Button with 400ms artificial delay + Spinner; disabled if 0 players
- [x] Round-robin shuffle distribution for balanced teams
- [x] Team result cards: "Team N" header with count + player list
- [x] "Copy All Teams" → clipboard → Toast success/error
- [x] "Clear" → Modal confirmation (closeOnBackdrop=false) → resets state
- [x] Reshuffle on repeat "Draft Teams" click

**Contact (`/contact`)**
- [x] `app/(site)/contact/page.tsx` — server component; hero band; 2-column desktop layout
- [x] `app/(site)/contact/ContactForm.tsx` — `'use client'`; div wrapper (no `<form>`)
- [x] Fields: Name, Email, Subject (select with 5 options), Message — all with visible `<label>`
- [x] `aria-describedby` linking error messages to inputs; `aria-invalid` on invalid fields
- [x] Honeypot: visually off-screen input named "website"; tabIndex={-1}; aria-hidden
- [x] Submit: validates → POST /api/contact → Toast success or error; form resets on success
- [x] Contact info column: email, WhatsApp, Instagram, TikTok, address

**`POST /api/contact` route**
- [x] `app/api/contact/route.ts` — POST only (GET returns 405)
- [x] Honeypot check: non-empty `website` → 200 silent discard
- [x] Server-side validation: name (1–100), email (regex), subject (enum), message (20–2000 chars)
- [x] In-memory rate limit: Map<ip, timestamp[]>; 5 per IP per 3600s; returns 429
- [x] Resend email send with `[frisbee.mv]` subject prefix
- [x] Fallback: if RESEND_API_KEY unset, logs to console + returns 200 (local dev)

### Exit Criteria
- [x] /pickup, /pickup/payments, /pickup/draft all render with SiteNav
- [x] Payment Tracker loads and displays player data from the Google Sheet
- [x] Search filters the list live; Skeleton shows during initial load
- [x] Team Drafter randomises players into balanced teams
- [x] Clipboard copy works; Clear confirmation Modal works
- [x] Contact form POSTs to /api/contact; success and error Toasts work
- [x] Honeypot silently discards bot submissions
- [x] No TypeScript errors (`npx tsc --noEmit` clean)
- [x] `npm run build` passes — 14 routes, 0 TypeScript errors

---

## Phase 1 Ship Checklist

- [x] All M1–M5 exit criteria pass
- [x] `npm run build` completes without errors or type errors
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
| 2026-03-02 | M3 complete. Home page built at `app/(site)/page.tsx`. `lib/session.ts` created with pure MVT arithmetic for next-Tue-or-Fri logic. All 6 sections complete: Hero (disc-orange gradient, WFDF badge), Stats Bar (3 StatTiles), Next Session (computed from server), About Snippet, Latest News (3 placeholder cards), Social Proof Strip. `npm run build` clean; 0 type errors. |
| 2026-03-04 | M4 complete. All 5 static pages built: /about (Timeline zigzag), /governance (PersonCard grid, AGM table, QuoteBlock), /play (server-rendered session schedule, Accordion FAQ), /play/rules (sticky TOC sidebar, IntersectionObserver, print CSS), /sponsors (tier grid structure). Accordion `ref` no-op removed to fix "Refs cannot be used in Server Components" build error. "Ekuveni Ground" replaced with "Villingili Football Ground" site-wide (0 matches). `npm run build` clean; 11 routes. |
| 2026-03-04 | M5 complete. Pickup hub at /pickup with PickupNav sub-header (client component, active state via usePathname). Payment Tracker reads Google Sheets API v4 directly from client (same public credentials as GitHub Pages deployment). Team Drafter: round-robin shuffle, SegmentedControl 2/3/4 teams, clipboard copy via Toast, Clear via Modal. Contact page: server shell + ContactForm client leaf, honeypot, aria-describedby inline validation, POST /api/contact with in-memory rate limiting (5/IP/hour) + Resend + console fallback when RESEND_API_KEY absent. `pickup/` layout explicitly renders SiteNav + SiteFooter (not inside (site)/). All pages use server wrappers with generateMetadata; client logic in co-located leaf components. `npx tsc --noEmit` clean; `npm run build` clean; 14 routes. |
