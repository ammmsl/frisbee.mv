# frisbee.mv — Frontend Implementation Plan
## Ultimate Frisbee Association (UFA) · Phases 1 & 2

**Document version:** 1.0  
**Companion documents:** Technical Specification v1.0 · Frontend Technical Requirements Specification v1.0  
**Status:** Ready for development

---

## How to Read This Plan

Work is grouped into **milestones** that bundle logically related tasks. Each milestone can be started only when its dependencies are complete. Within a milestone, tasks are largely parallelisable unless noted.

**Milestone sequence:**

```
M0 → M1 → M2 → M3 → M4 → M5 → [Phase 1 ship] → M6 → M7 → M8 → [Phase 2 ship]
```

Exit criteria from the Technical Specification are mapped to the milestone that satisfies them.

---

## Pre-Development Checklist

Before writing any component code, the following decisions and setup tasks must be complete. They are blockers for everything else.

- [ ] **Theme decision locked:** light `(site)/` routes, dark `/league/*` — confirmed
- [ ] **Accent colour confirmed:** `#FF6B35` contrast ratios verified on white and on `bg-gray-950`; adjust shade if needed
- [ ] **Display font selected and licensed:** Inter or DM Sans (variable font) added via `next/font`
- [ ] **Repository forked/branched from existing League Tracker codebase**
- [ ] **Vercel project configured:** `frisbee.mv` custom domain, DNS pointed, environment variables set for Production and Preview
- [ ] **Environment variables added to `.env.local`:** `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`, `RESEND_API_KEY`
- [ ] **`/public/documents/` directory created** and AGM PDF files added
- [ ] **`/config/` directory created** with `board.json`, `committees.json`, `documents.json`, `sponsors.json` populated
- [ ] **Action photo(s) supplied** for home hero (development placeholder acceptable for M1)
- [ ] **`next.config.ts` updated:** Google Photos remote patterns added

---

## Milestone 0 — Repo Migration & Route Relocation

**Goal:** Move existing league tracker routes to `/league/*` without breaking anything. This clears the path for the new site root without touching any league functionality.

**Dependency:** None — first task

### Tasks

| Task | Notes |
|---|---|
| Move `app/page.tsx` → `app/league/page.tsx` | League home becomes `/league` |
| Move `app/standings/`, `app/fixtures/`, `app/match/`, `app/teams/`, `app/team/`, `app/players/`, `app/player/`, `app/spirit/` → under `app/league/` | All league sub-routes |
| Update all internal links in league components: `/standings` → `/league/standings` etc. | Update `PublicNav.tsx` links and any hardcoded `<Link>` hrefs |
| Add 301 redirects in `next.config.ts` for old paths | See Technical Spec §7.3 for full redirect list |
| Verify `/pickem/*` — stays at same path, no change needed | Confirm no broken internal links |
| Smoke test all existing league routes at new `/league/*` paths | All league and pickem functionality must work identically |

**Exit criteria:**
- [ ] All existing league tracker routes work at `/league/*`
- [ ] Pick'em works at `/pickem/*`
- [ ] Old paths (e.g. `/standings`) 301-redirect to `/league/standings`

---

## Milestone 1 — Design Tokens, Global CSS & Shell Layout

**Goal:** Establish the visual shell and layout infrastructure that every subsequent page depends on. Nothing else can be built without this.

**Dependency:** M0 complete; pre-development checklist complete

### Tasks

**1.1 Global CSS & Design Tokens**
- Add CSS custom property tokens to `app/globals.css`:
  - `--accent: #FF6B35`
  - Light/dark palette tokens (`--bg-page`, `--bg-surface`, `--text-primary`, `--text-muted`, `--border`)
- Configure Tailwind CSS v4 to reference these tokens
- Add display font via `next/font` in `app/layout.tsx`

**1.2 Route Group Layout**
- Create `app/(site)/layout.tsx`
- Apply light theme CSS variable scope at this layout boundary
- Mount `SiteNav` and `SiteFooter` in this layout

**1.3 SkipLink Component**
- `app/_components/SkipLink.tsx`
- Add as first child in `app/layout.tsx` root
- Target: `#main-content` on `<main>` in every page layout

**1.4 SiteFooter Component**
- `app/_components/SiteFooter.tsx`
- Four-column desktop layout, stacked mobile
- Registration statement (verbatim)
- Dynamic copyright year
- Social links (icon + label pairs)
- WFDF + AOFDF logos

**1.5 SiteNav — Desktop**
- `app/_components/SiteNav.tsx`
- Sticky, solid background (all pages except home hero)
- All nav links (including News — page deferred but link present)
- Active state via `usePathname()`
- WFDF + AOFDF badges in desktop right zone
- Desktop Dropdown Menu for "Play" sub-items

**1.6 DropdownMenu (Play sub-nav)**
- Inline in SiteNav or `app/_components/DropdownMenu.tsx`
- Items: "Join a Session" → `/play`, "Rules" → `/play/rules`
- Hover (desktop) + click/tap (tablet) open
- Keyboard: Enter/Space opens, arrow keys navigate, Escape closes

**1.7 Drawer (Mobile Navigation)**
- `app/_components/Drawer.tsx`
- Triggered from SiteNav hamburger button (44×44px)
- Full-screen overlay on mobile
- Focus trap while open
- All nav links inline (no nested drawer)
- Social + WFDF/AOFDF logos at bottom
- CSS transition only

**1.8 `app/layout.tsx` Root Updates**
- Add site-wide metadata defaults
- Mount font variable
- Mount SkipLink

**Milestone 1 deliverable:** The visual shell renders correctly on all routes. Every page has the SiteNav, SiteFooter, and SkipLink. Mobile navigation works.

---

## Milestone 2 — Shared Component Library (Phase 1 Set)

**Goal:** Build all reusable primitive components needed for Phase 1 pages. These are built once here and consumed by all page milestones.

**Dependency:** M1 complete (design tokens available)

> Tasks within this milestone are independent and can be worked in parallel.

### Tasks

**2.1 Button**
- `app/_components/Button.tsx`
- Variants: Primary (disc-orange fill), Secondary (outline), Ghost, Destructive (red)
- Min height 44px, horizontal padding ≥ 16px
- Loading state: Spinner replaces label; disabled during load
- Icon + text support

**2.2 Badge**
- `app/_components/Badge.tsx`
- 7 variants: `wfdf`, `upcoming`, `past`, `cancelled`, `paid`, `unpaid`, `partial`
- Pill shape; WFDF variant: icon + text
- WCAG AA contrast verified on all backgrounds

**2.3 Spinner & Skeleton**
- `app/_components/Spinner.tsx` — small inline spinner
- `app/_components/Skeleton.tsx` — animated shimmer; accept `className` for shape customisation

**2.4 Toast**
- `app/_components/Toast.tsx`
- Variants: success, error, info
- Bottom-right desktop / bottom-centre mobile
- Auto-dismiss 4s + manual close
- `role="status"` + `aria-live="polite"`

**2.5 Accordion**
- `app/_components/Accordion.tsx`
- `<details>`/`<summary>` based (JS-optional, server-renderable)
- CSS grid height animation
- All-independent expansion behaviour
- Min 44px trigger height

**2.6 Table**
- `app/_components/Table.tsx`
- Semantic HTML: `<table>`, `<thead>`, `<th scope="col">`, `<td>`
- Responsive horizontal scroll wrapper
- Zebra striping prop

**2.7 FileDownloadLink**
- `app/_components/FileDownloadLink.tsx`
- PDF icon + document name + optional file size
- `target="_blank"` + `rel="noopener noreferrer"`
- `aria-label` prop (required)

**2.8 Avatar & PersonCard**
- `app/_components/Avatar.tsx` — photo or initials fallback (accent palette)
- `app/_components/PersonCard.tsx` — Avatar + Name + Title + Term + bio (3-line truncation)
- Consistent card height via CSS grid

**2.9 QuoteBlock**
- `app/_components/QuoteBlock.tsx`
- `<blockquote>` element
- Large accent-colour left border, slightly larger font size
- Optional quotation mark decoration

**2.10 SearchInput**
- `app/_components/SearchInput.tsx`
- `input type="search"`, min 44px height
- Clear (×) button when value present
- `onChange` callback for live filter

**2.11 SegmentedControl**
- `app/_components/SegmentedControl.tsx`
- Renders 2–4 options as a button group
- Single selection; selected state: filled background; unselected: outline/ghost

**2.12 Modal**
- `app/_components/Modal.tsx`
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- Focus trap; Escape closes; backdrop click configurable (off for destructive)
- Scale + fade-in CSS animation

**2.13 StatTile (Animated Counter)**
- `app/_components/StatTile.tsx` — Client Component (`'use client'`)
- `IntersectionObserver` scroll trigger
- `requestAnimationFrame` counter, ~1.5s ease-out
- Large number + label + optional icon

**Milestone 2 deliverable:** All Phase 1 primitive components available and individually testable.

---

## Milestone 3 — Home Page

**Goal:** Ship the new site home page, replacing the League Tracker root.

**Dependency:** M1 (shell), M2 (Button, Badge, StatTile, Skeleton)

### Tasks

**3.1 Home Page Server Component**
- `app/page.tsx`
- `revalidate = 0`
- `generateMetadata` export

**3.2 Hero Section**
- Full-width photo with dark gradient overlay
- Headline + tagline (display font, white)
- Two CTA Buttons: "Join a Session" (Primary) + "View League" (Ghost/outline)
- WFDF Provisional Member Badge overlay
- SiteNav transparent-on-hero: add `IntersectionObserver` trigger to hero section
- Verify: above the fold at 390px, 844px, 932px

**3.3 Live Stats Bar**
- Three StatTile components
- Horizontally scrollable container on mobile (no page-body overflow)
- Values: 167 players, 113+ consecutive weeks, 3,481+ attendances (hardcoded)

**3.4 Next Session Block**
- Hardcoded logic: compute next Tuesday or Friday from `new Date()`
- Display: day, date, time, location
- "Get directions" Button (icon + text) → Google Maps link

**3.5 About Snippet**
- 2–3 sentence description
- "Learn more" → `/about`

**3.6 Latest News Row (Phase 1 Placeholder)**
- 3-column grid desktop / horizontal scroll mobile
- Static placeholder cards with "Announcements coming soon" message
- Section must not be blank

**3.7 Social Proof Strip**
- Instagram + TikTok links
- WFDF + AOFDF logos

**Exit criteria:**
- [ ] `frisbee.mv` resolves and serves the new home page
- [ ] Mobile layout tested at 390px — no horizontal overflow

---

## Milestone 4 — Static Informational Pages

**Goal:** Build all static federation pages needed for WFDF compliance review.

**Dependency:** M1 (shell), M2 (Accordion, Table, FileDownloadLink, Avatar, PersonCard, QuoteBlock, Badge)

> Pages within this milestone are independent and can be built in parallel.

### Tasks

**4.1 About Page** (`/about`)
- Timeline component (vertical, data-driven from array)
- Desktop: alternating left/right; mobile: single column
- Accent-colour connecting line + circular markers; "active" state on latest milestone
- About the Sport section + "Where We Play" city cards

**4.2 Governance Page** (`/governance`)
- Board grid: PersonCard × 4 (photo or initials fallback)
- Committees list
- "How We're Governed" paragraph
- WFDF Membership section with QuoteBlock (AOFDF letter paraphrase)
- AGM Documents Table with FileDownloadLink per row (PDFs from `/public/documents/`)

**4.3 Play Page** (`/play`)
- Next Session block (same logic as home page)
- Session Schedule Table (server component, no JS)
- "Where to Go" + "What to Bring" checklist
- "It's Free to Try" section
- Beginner FAQ Accordion (`<details>`/`<summary>` — must work without JS)
- "Become a Member" section + Google Form CTA

**4.4 Rules Page** (`/play/rules`)
- Long-form layout: max-width 720px
- QuoteBlock: *"Ultimate is self-refereed. Spirit is everything."*
- Sticky TOC sidebar (desktop only, `lg:` breakpoint) with `IntersectionObserver` active section highlighting
- External link to WFDF rulebook
- Print stylesheet: `@media print` hides nav chrome and TOC

**4.5 Sponsors Page** (`/sponsors`)
- Structural placeholder
- Tier grid (empty structure)
- Contact CTA

**4.6 `generateMetadata` for all static pages**
- Title pattern: `"Page Title | frisbee.mv"`
- Description: 120–160 characters
- OG title + description (static image acceptable for Phase 1)

**Exit criteria:**
- [ ] `/about`, `/governance`, `/play`, `/play/rules`, `/sponsors` all render correctly
- [ ] AGM documents downloadable from `/governance`

---

## Milestone 5 — Interactive Tools & Contact

**Goal:** Migrate the two GitHub Pages tools and ship the contact page.

**Dependency:** M1 (shell), M2 (SearchInput, Badge, SegmentedControl, Modal, Spinner, Skeleton, Button, Toast)

### Tasks

**5.1 Pickup Hub** (`/pickup`)
- `app/pickup/layout.tsx` with PickupNav sub-header
- `app/pickup/page.tsx` — tool link cards (Payment Tracker, Team Drafter)

**5.2 Payment Status Tracker** (`/pickup/payments`)
- Port UFApayPLS HTML/JS logic to Next.js Client Component
- SearchInput at top (live client-side filter — no re-fetch)
- Player list with paid/unpaid/partial Badge per row
- Skeleton loader while data loads
- Last updated timestamp
- "How to pay" link
- Mobile: test at 390px in bright-light conditions — Badges must be high-contrast and legible

**5.3 Team Drafter** (`/pickup/draft`)
- Port TeamDraft HTML/JS logic to Next.js Client Component
- Player name input + import option
- SegmentedControl for team count (2/3/4)
- "Randomise" Button + inline Spinner
- "Copy teams to clipboard" → Toast
- "Clear teams" → Modal confirmation
- Works offline after load (no backend)

**5.4 Contact Page** (`/contact`)
- Server component shell + Client Component form leaf node
- Fields: Name, Email, Subject (select), Message (textarea)
- Visible `<label>` on all fields; no placeholder-only labels
- Inline validation on blur; `aria-describedby` error linking
- Honeypot field
- Submit: Spinner → Toast (success/error)
- No `<form>` element — `onClick` handler

**5.5 `POST /api/contact` Route**
- Server-side field validation
- Resend (or Nodemailer SMTP) email send
- Rate limit: 5 per IP per hour
- Returns 200 / 400

**Exit criteria:**
- [ ] Payment Tracker live at `/pickup/payments`, reads Google Sheet
- [ ] Team Drafter live at `/pickup/draft`
- [ ] Contact form submits successfully and sends email
- [ ] `SiteNav` present and functional on all routes
- [ ] All three GitHub Pages deployments retired (repos archived/redirected)

---

## Phase 1 Ship — Validation & Hardening

Before Phase 2 work begins, all Phase 1 exit criteria must pass.

### Final Phase 1 Checklist

- [ ] `frisbee.mv` resolves and serves the new home page
- [ ] All existing league tracker routes work at `/league/*`
- [ ] Pick'em works at `/pickem/*`
- [ ] Payment Tracker is live at `/pickup/payments` and reads Google Sheet
- [ ] Team Drafter is live at `/pickup/draft`
- [ ] `/about`, `/governance`, `/play`, `/play/rules`, `/sponsors`, `/contact` all render correctly
- [ ] `SiteNav` present and functional on all routes
- [ ] Mobile layout tested at 390px — no horizontal overflow on any page
- [ ] Contact form submits and sends email
- [ ] AGM documents downloadable from `/governance`
- [ ] All three GitHub Pages deployments officially retired
- [ ] Old league tracker root URL redirects to `/league`
- [ ] Accessibility audit: Skip Link, focus ring, contrast, `alt` text, keyboard nav
- [ ] Lighthouse score ≥ 90 on Home page mobile

---

## Milestone 6 — Phase 2 Infrastructure & Database

**Goal:** Set up all backend infrastructure needed before Phase 2 pages can be built.

**Dependency:** Phase 1 shipped

### Tasks

**6.1 Database Schema — New Tables**
- Run migrations in Supabase to create:
  - `events` table (see Technical Spec §5.2)
  - `news_posts` table
  - `session_overrides` table

**6.2 Seed Data**
- Seed at least one past event: Bodu Match 2024 and Glow-in-the-dark event
- Seed at least one published news post: AGM announcement
- Seed any known session overrides (cancelled sessions, public holidays)

**6.3 Google Sheets API Integration**
- Add Phase 2 environment variables: `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEETS_ID`
- Create `lib/sheets.ts`:
  - `getSessionDates(): Promise<Date[]>` — historical session dates from Sheet
  - `getPaymentStatus(): Promise<PlayerPaymentStatus[]>` — (reuse/replace Phase 1 client fetch)
- Wrap all Sheets calls in `unstable_cache` with 5-minute TTL

**6.4 `GET /api/calendar` Route**
- Query param: `month=YYYY-MM`
- Marshals data from Sheets cache + Supabase `events` + `session_overrides`
- Returns `{ date, type, label?, eventSlug? }[]`

**6.5 `lib/events.ts` Helpers**
- `getPublishedEvents()` — all published events
- `getEventBySlug(slug)` — single event or null
- `getPublishedNews(page, pageSize)` — paginated news posts
- `getNewsBySlug(slug)` — single post or null

**6.6 Admin Phase 2 Routes**
- `/admin/events` — list events, toggle published
- `/admin/events/new` and `/admin/events/[eventId]` — create/edit event forms
- `/admin/news` — list posts, toggle published
- `/admin/news/new` and `/admin/news/[postId]` — create/edit post (textarea + live preview)
- `/admin/calendar/overrides` — add/remove session overrides
- All routes protected by existing JWT middleware

**6.7 OG Image Generation (Phase 2)**
- Extend `/api/og` route to handle event and news post pages

**Exit criteria:**
- [ ] Google Sheets API connection is live and session dates are loading from the sheet
- [ ] All new images properly configured in `next.config.ts` remote patterns
- [ ] Admin can create, edit, and publish events and news posts
- [ ] Admin can add session overrides

---

## Milestone 7 — Phase 2 Shared Components

**Goal:** Build the additional reusable components needed for Phase 2 pages.

**Dependency:** M6 (data layer available to test against); M2 complete

> Tasks within this milestone are independent.

### Tasks

**7.1 EventCard**
- `app/_components/EventCard.tsx`
- Cover image (`<Image>`, `alt` required), title, date (MVT), city/location, event type Badge
- Full card clickable → `/events/[slug]`
- Fallback image when `cover_image_url` is null

**7.2 NewsCard**
- `app/_components/NewsCard.tsx`
- Thumbnail, headline, date + author, 2-line excerpt (truncated)
- Full card clickable → `/news/[slug]`

**7.3 Tabs**
- `app/_components/Tabs.tsx`
- `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`
- Full-width equal distribution on mobile

**7.4 EmptyState**
- `app/_components/EmptyState.tsx`
- Disc icon/illustration
- `message` and `ctaLabel` + `ctaHref` props
- Distinct copy for each context (no generic copy)

**7.5 Pagination**
- `app/_components/Pagination.tsx`
- Previous / next navigation
- Server-rendered: `?page=N` query params
- `aria-label="Pagination navigation"`, `aria-current="page"` on current
- Page size: 12 posts

**7.6 CalendarWidget**
- `app/_components/CalendarWidget.tsx` — Client Component (`'use client'`)
- Month grid (desktop) / week strip with horizontal scroll (mobile < 640px)
- Colour-coded day markers: blue session, orange event, grey cancelled
- Day click: expand detail panel below
- Month navigation: prev/next arrows trigger `/api/calendar?month=YYYY-MM` fetch
- `aria-live` region for announcements
- Cancelled sessions from `session_overrides`: visual strikethrough or red indicator
- Day cell minimum 40px
- **Build mobile-first; test at 390px before any other breakpoint**
- No external calendar library

---

## Milestone 8 — Phase 2 Pages

**Goal:** Ship all Phase 2 content pages.

**Dependency:** M6 (data layer), M7 (components)

> Pages within this milestone are independent and can be built in parallel.

### Tasks

**8.1 Calendar Page** (`/calendar`)
- Server component page pre-loads current month data
- Renders `CalendarWidget` with pre-fetched data as props
- Upcoming list section: next 4 sessions + upcoming events (60-day window)
- Past events: collapsible reverse-chronological list

**8.2 Events List Page** (`/events`)
- Server component; `revalidate = 0`
- Tabs (Upcoming / Past)
- EventCard grid (3-column desktop, 1-column mobile)
- EmptyState per tab
- `generateMetadata`

**8.3 Event Detail Page** (`/events/[slug]`)
- Server component; `revalidate = 0`
- `notFound()` for invalid slug or unpublished
- Event header, description, Photos CTA (link-out only), Related Events
- OG image (`/api/og`)
- `application/ld+json` structured data

**8.4 News List Page** (`/news`)
- Server component; `revalidate = 0`
- NewsCard grid
- Filter Tabs (All / Announcements / Tournament Results / Federation Updates)
- Pagination (12 per page, `?page=N`)
- EmptyState per filter
- `generateMetadata`

**8.5 News Post Page** (`/news/[slug]`)
- Server component; `revalidate = 0`
- `notFound()` for invalid slug or draft
- Markdown body rendered via `marked` or `remark`
- Reading layout: max-width 720px
- "Back to News" link
- Related posts (2 most recent)
- WhatsApp share link + copy link → Toast
- OG image (`/api/og`)

**8.6 Home Page — Phase 2 Upgrade**
- Replace hardcoded Next Session block with live `/api/calendar` query
- Replace placeholder news row with live `news_posts` query
- Update hero: optionally surface next session date dynamically

**Exit criteria (Phase 2 complete when all pass):**
- [ ] `/calendar` renders with correct session dates for current and next month
- [ ] Cancelled sessions (from `session_overrides`) display as cancelled on calendar
- [ ] Events appear on calendar on correct dates
- [ ] `/events` lists all published events, separated into upcoming and past
- [ ] At least one past event (Bodu Match 2024, Glow-in-the-dark) seeded and displays with Google Photos link
- [ ] `/events/[slug]` renders for valid slug; returns 404 for invalid
- [ ] `/news` renders with at least one published post
- [ ] `/news/[slug]` renders markdown body correctly
- [ ] Admin can create, edit, and publish events and news posts
- [ ] Admin can add session overrides
- [ ] Google Sheets API live; session dates loading from sheet
- [ ] All new images configured in `next.config.ts` remote patterns
- [ ] OG images generated for event and news post pages
- [ ] Mobile layout tested at 390px — calendar widget usable on mobile

---

## Summary Milestone Map

```
Pre-Development Checklist
        │
        ▼
M0: Route Migration (league → /league/*)
        │
        ▼
M1: Shell & Global Layout (SiteNav, Footer, SkipLink, CSS tokens)
        │
        ▼
M2: Shared Component Library (all Phase 1 primitives)
        │
     ┌──┴──────────┬──────────────┐
     ▼             ▼              ▼
M3: Home     M4: Static      M5: Tools &
    Page         Pages           Contact
     │       (About, Gov,    (Pickup, Team
     │       Play, Rules,     Drafter,
     │       Sponsors)        Contact API)
     └──────────────┴──────────────┘
                   │
                   ▼
          ┌── Phase 1 Ship ──┐
          │  (all exit crit.) │
          └──────────────────┘
                   │
                   ▼
M6: Phase 2 Infrastructure
    (DB tables, seeds, Sheets API,
     calendar API route, admin routes)
        │
        ▼
M7: Phase 2 Shared Components
    (EventCard, NewsCard, Tabs,
     EmptyState, Pagination, CalendarWidget)
        │
     ┌──┴──────────────────┐
     ▼                     ▼
M8a: Calendar &       M8b: News &
     Events Pages          Home P2 upgrade
     │                     │
     └──────────────────────┘
                   │
                   ▼
          ┌── Phase 2 Ship ──┐
          │  (all exit crit.) │
          └──────────────────┘
```

---

## Component → Milestone Cross-Reference

| Component | Milestone Built | First Consumed |
|---|---|---|
| SkipLink | M1 | M1 (all pages) |
| SiteNav + Drawer + DropdownMenu | M1 | M1 (all pages) |
| SiteFooter | M1 | M1 (all pages) |
| Button | M2 | M3 (home hero CTAs) |
| Badge | M2 | M3 (WFDF badge), M5 (payment) |
| Spinner + Skeleton | M2 | M5 (tools, contact) |
| Toast | M2 | M5 (contact, team drafter) |
| Accordion | M2 | M4 (play page FAQ) |
| Table | M2 | M4 (governance, play schedule) |
| FileDownloadLink | M2 | M4 (governance docs) |
| Avatar + PersonCard | M2 | M4 (governance board) |
| QuoteBlock | M2 | M4 (rules, governance) |
| StatTile | M2 | M3 (home stats bar) |
| SearchInput | M2 | M5 (payment tracker) |
| SegmentedControl | M2 | M5 (team drafter) |
| Modal | M2 | M5 (team drafter clear) |
| EventCard | M7 | M8 (events list, calendar) |
| NewsCard | M7 | M8 (news list, home P2) |
| Tabs | M7 | M8 (events, news) |
| EmptyState | M7 | M8 (events, news, calendar) |
| Pagination | M7 | M8 (news list) |
| CalendarWidget | M7 | M8 (calendar page) |

---

*Ultimate Frisbee Association · frisbee.mv Frontend Implementation Plan v1.0 · March 2026*
