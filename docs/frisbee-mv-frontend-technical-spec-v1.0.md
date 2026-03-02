# frisbee.mv — Frontend Technical Requirements Specification
## Maldives Flying Disc Federation (MFDF) · Phases 1 & 2

**Document version:** 1.0  
**Derived from:** frisbee.mv Technical Specification v1.0 · Frontend Component Specification v1.0  
**Organisation:** Maldives Flying Disc Federation (MFDF)  
**Domain:** frisbee.mv  
**Stack:** Next.js 16 · Tailwind CSS v4 · Supabase (Postgres) · Vercel  
**Status:** Ready for development

---

## Table of Contents

1. [Design System Decisions](#1-design-system-decisions)
2. [Global Layout & Shell Components](#2-global-layout--shell-components)
3. [Home Page (`/`)](#3-home-page-)
4. [About Page (`/about`)](#4-about-page-about)
5. [Governance Page (`/governance`)](#5-governance-page-governance)
6. [Play Page (`/play`)](#6-play-page-play)
7. [Rules Page (`/play/rules`)](#7-rules-page-playrules)
8. [Pickup Hub & Tools (`/pickup/*`)](#8-pickup-hub--tools-pickup)
9. [Sponsors Page (`/sponsors`)](#9-sponsors-page-sponsors)
10. [Contact Page (`/contact`)](#10-contact-page-contact)
11. [Phase 2 — Calendar Page (`/calendar`)](#11-phase-2--calendar-page-calendar)
12. [Phase 2 — Events Pages (`/events/*`)](#12-phase-2--events-pages-events)
13. [Phase 2 — News Section (`/news/*`)](#13-phase-2--news-section-news)
14. [Shared Component Library](#14-shared-component-library)
15. [Accessibility Requirements](#15-accessibility-requirements)
16. [Frontend Conventions & Standards](#16-frontend-conventions--standards)

---

## 1. Design System Decisions

These decisions must be locked before any Phase 1 component development begins.

### 1.1 Theming

**Decision: Option B** — Light theme for `(site)/` routes, dark theme for `/league/*` routes.

- `(site)/` routes use a light background palette suited to text-heavy, institutional content
- `/league/*` routes retain the existing dark theme (`bg-gray-950` / `bg-gray-900`)
- Theme boundary is enforced at the route group layout level via a CSS variable swap in `(site)/layout.tsx`
- The `/pickup/*` routes inherit from the nearest layout; default to a light or neutral palette

### 1.2 Colour Tokens

| Token | Value | Usage |
|---|---|---|
| `--accent` | `#FF6B35` (disc-orange) | Primary CTAs, badge fills, accent borders, timeline markers |
| `--bg-page` | Light: `#FFFFFF` / Dark: `#030712` | Page background per theme |
| `--bg-surface` | Light: `#F9FAFB` / Dark: `#111827` | Card / surface background |
| `--text-primary` | Light: `#111827` / Dark: `#F9FAFB` | Body text |
| `--text-muted` | Light: `#6B7280` / Dark: `#9CA3AF` | Secondary labels |
| `--border` | Light: `#E5E7EB` / Dark: `#1F2937` | Component borders |

All colour pairs must pass WCAG AA contrast (4.5:1 for body text, 3:1 for large text/UI components).

> **Critical check:** `#FF6B35` on white background and on `bg-gray-950` — verify contrast ratios and adjust shade if needed before committing to component implementations.

### 1.3 Typography

- **Display / heading font:** one variable font (Inter or DM Sans) — applied via `next/font`
- **Body font:** system font stack — no additional download
- **Base font size:** 16px
- **Long-form reading width:** max-content-width `720px` (applied on Rules page and News posts)

### 1.4 Breakpoints (Tailwind)

| Name | Width | Tailwind prefix |
|---|---|---|
| Mobile | < 640px | *(default)* |
| Tablet | 640px–1024px | `sm:` |
| Desktop | > 1024px | `lg:` |

**Mobile-first.** All components are designed for < 640px first.

### 1.5 Touch Targets

**Minimum 44×44px** on all interactive elements. Achieved via padding, not fixed width/height on the element itself. The one exception is calendar day cells (minimum 40px with generous tap area on the day detail below).

---

## 2. Global Layout & Shell Components

These components live in `app/_components/` and are built before any page work begins.

---

### 2.1 Skip Link

**File:** `app/_components/SkipLink.tsx`  
**Rendered in:** `app/layout.tsx` as the first child of `<body>`

**Requirements:**
- Visually hidden by default; visible on `:focus` with accent-colour styling
- Links to `#main-content` (`id` applied to `<main>` in every layout)
- Zero additional dependencies — one JSX element, one CSS rule

---

### 2.2 SiteNav (Header)

**File:** `app/_components/SiteNav.tsx`  
**Rendered in:** `app/(site)/layout.tsx`

**Navigation links:**

| Label | Route | Notes |
|---|---|---|
| frisbee.mv (wordmark/logo) | `/` | Always links home |
| About | `/about` | |
| Play | `/play` | Desktop: Dropdown Menu with sub-links |
| League | `/league` | |
| Pickup | `/pickup` | |
| News | `/news` | Phase 2 page, link present from Phase 1 |
| Contact | `/contact` | |

**Behaviour requirements:**
- Sticky on scroll; adds shadow/border on scroll via `IntersectionObserver` on the hero
- **Home page only:** transparent background on hero, transitions to solid on scroll. All other pages: always solid
- Active state: current top-level route segment highlighted using `usePathname()`
- Desktop: inline nav links + Dropdown Menu on "Play" item (§2.4)
- Mobile (< 640px): hamburger icon (44×44px) triggers Drawer (§2.3)
- Desktop: WFDF and AOFDF logo badges in the right zone of the header
- Mobile: WFDF/AOFDF logos hidden in nav; appear in footer and mobile Drawer

---

### 2.3 Drawer (Mobile Navigation)

**File:** `app/_components/Drawer.tsx`  
**Rendered in:** SiteNav (triggered by hamburger button)

**Requirements:**
- Full-screen overlay on mobile (simpler than slide-in; avoids layout shift on narrow screens)
- Triggered by hamburger button in SiteNav; closed by Escape key, backdrop tap, or close button
- Focus trap while open (keyboard accessibility)
- Nav items: full list with Play sub-items inline (no nested drawer)
- Social links (Instagram, TikTok) and WFDF/AOFDF logos at the drawer bottom
- CSS transition only — no JS animation library
- `aria-expanded` on trigger button; `role="dialog"` on drawer panel

---

### 2.4 Dropdown Menu (Play sub-navigation)

**File:** Inline in `SiteNav.tsx` or `app/_components/DropdownMenu.tsx`

**Items:**
- "Join a Session" → `/play`
- "Rules" → `/play/rules`

**Requirements:**
- Desktop: opens on hover and on click/tap
- Mobile: replaced by inline items in Drawer — no dropdown on mobile
- Keyboard: opens on Enter/Space, arrow keys navigate items, Escape closes
- Animation: subtle fade + `translateY` (CSS only)
- Meets `aria-haspopup`, `aria-expanded` requirements

---

### 2.5 SiteFooter

**File:** `app/_components/SiteFooter.tsx`  
**Rendered in:** `app/(site)/layout.tsx`

**Layout:**
- Four columns on desktop, stacked on mobile
- Column 1: Navigation links
- Column 2: Community (WhatsApp, Instagram, TikTok) — icon + text label pairs (no icon-only)
- Column 3: Affiliations (WFDF + AOFDF logos with links)
- Column 4: Legal / Contact (`hello@frisbee.mv`)

**Required content:**
- Registration statement (verbatim): *"Registered with the Commissioner of Sports, Republic of Maldives · WFDF Provisional Member"*
- Dynamic copyright year: `© {new Date().getFullYear()} MFDF`

---

### 2.6 Badge

**File:** `app/_components/Badge.tsx`

**Variants:**

| Variant | Colour | Usage |
|---|---|---|
| `wfdf` | Accent orange or WFDF blue | SiteNav desktop, home hero overlay |
| `upcoming` | Green | EventCard |
| `past` | Neutral grey | EventCard |
| `cancelled` | Red/amber | EventCard |
| `paid` | Green | Payment Tracker rows |
| `unpaid` | Red | Payment Tracker rows |
| `partial` | Amber | Payment Tracker rows |

**Requirements:**
- Pill shape; icon + text treatment for the WFDF badge (shield or check icon + label)
- Payment status badges: high-contrast — tested at 390px in high-ambient-light conditions
- All variants must pass WCAG AA on their respective backgrounds

---

### 2.7 Spinner & Skeleton

**File:** `app/_components/Spinner.tsx`, `app/_components/Skeleton.tsx`

**Spinner:** Small inline indicator; used for momentary actions (Team Drafter randomise, form submit button).

**Skeleton:** Animated shimmer placeholder matching the shape of the content being loaded.
- Payment Tracker: player row skeleton
- News cards: card skeleton
- Phase 2 Calendar: calendar grid skeleton

**Rule:** Use Skeleton (not Spinner) wherever a page section or list is loading. Use Spinner only for discrete button-triggered async actions.

---

### 2.8 Toast

**File:** `app/_components/Toast.tsx`

**Requirements:**
- Position: bottom-right on desktop, bottom-centre on mobile
- Auto-dismiss after 4 seconds; manual close button
- Variants: `success` (green), `error` (red), `info` (neutral)
- `role="status"` + `aria-live="polite"` for screen reader announcements
- **Usage sites:** contact form success/error, Team Drafter clipboard copy, admin save/publish confirmations

---

## 3. Home Page (`/`)

**File:** `app/page.tsx`  
**Rendering:** Server component (`revalidate = 0`)

### Sections

**3.1 Hero**
- Full-width, above the fold at 390px (no crop on 844px / 932px iPhone heights)
- Background: real action photo (supplied); dark gradient overlay for text readability
- Headline: federation name + tagline (display font, large, white)
- Two CTA buttons: "Join a Session" (primary, disc-orange) → `/play` and "View League" (secondary, ghost/outline) → `/league`
- WFDF Provisional Member Badge overlaid (bottom-left or top-right corner)
- SiteNav transparent on this section only (all other pages: always solid)
- Phase 2 enhancement: Next Session date pulled dynamically from calendar API

**3.2 Live Stats Bar**
- Three tiles: Total Unique Players (167), Consecutive Weeks Active (113+), Total Attendances (3,481+)
- Values are hardcoded in Phase 1; Phase 3 can replace with a Supabase query
- Layout: horizontal row on desktop; horizontally scrollable container on mobile (`overflow-x: auto`, no page-body overflow)
- Animated counter from 0 to target on `IntersectionObserver` scroll-in trigger
- Uses `requestAnimationFrame` with ~1.5s ease-out curve
- **This is the only justified Client Component (`'use client'`) on the home page**

**3.3 Next Session Block**
- Phase 1: hardcoded logic — next Tuesday or Friday evening in Malé
- Displays: day, date, time, location
- "Get directions" link → Google Maps (icon + text button)
- Phase 2: replaced by a live query to `/api/calendar`

**3.4 About Snippet**
- 2–3 sentences describing the federation
- "Learn more" → `/about`

**3.5 Latest News / Announcements**
- 3 cards in a 3-column desktop grid; horizontal scroll row on mobile (not stacked)
- Phase 1: static placeholder cards or empty state message — section must not be blank
- Phase 2: live from `news_posts` table

**3.6 Social Proof Strip**
- Instagram (@frisbee.mv) and TikTok (@frisbee.mv) links
- WFDF and AOFDF affiliation logos with external links

**3.7 Footer** — see §2.5

**Frontend requirements:**
- Hero image above the fold on all 390px+ screens
- Stats bar horizontally scrollable with no body overflow
- No horizontal scroll on the page body

---

## 4. About Page (`/about`)

**File:** `app/(site)/about/page.tsx`  
**Rendering:** Static (server component, no revalidation)

### Sections

**4.1 Page Hero**
- Photo or illustrated header + page title

**4.2 Our Mission**
- Short paragraph: making Ultimate mainstream across the Maldives, player development opportunities

**4.3 Timeline (Progress Indicator)**
- Vertical orientation
- Desktop: alternating left/right (zig-zag)
- Mobile: single column, all content right of the line
- Each milestone: date (bold), event title, optional short description
- Accent-colour connecting line (`#FF6B35`); circular markers; most recent milestone has distinct "active" state
- Data-driven: rendered from a static array — add milestones without JSX changes

| Date | Milestone |
|---|---|
| 2018 | First games — University of Nottingham Malaysia graduates |
| January 2024 | Weekly sessions formalised (Tuesdays and Fridays) |
| January 2024 | First tournament (5v5, 49 players) |
| March 2024 | Federation founded |
| September 2, 2024 | Registered by Commissioner of Sports |
| October 2024 | Largest tournament (7v7, 72 players) |
| December 12, 2024 | First AGM and executive committee election |
| December 2024 | WFDF Provisional Membership application submitted |

**4.4 About the Sport**
- Brief description of Ultimate Frisbee and Spirit of the Game
- "Read the rules" → `/play/rules`

**4.5 Where We Play**
- Cities: Malé (primary), Fuvahmulah, Addu City
- Styled city cards (no interactive map in Phase 1 — Phase 3 concern)

**Frontend requirements:**
- Timeline readable on mobile in single-column layout
- No external map API calls

---

## 5. Governance Page (`/governance`)

**File:** `app/(site)/governance/page.tsx`  
**Rendering:** Static  
**Data source:** `/config/board.json`, `/config/committees.json`, `/config/documents.json`

### Sections

**5.1 Board of Directors (Avatar / Person Card grid)**
- 2 columns on mobile, 4 on desktop
- Each card: Avatar (photo if available, initials fallback in accent palette), Name (bold), Title, Term, Short bio (3-line truncation)
- Consistent card height regardless of bio length
- Members: President (Aishath Uraiba Asif), VP (Ahmed Naaif Mohamed), Treasurer (Mohamed Amsal), Secretary General (Mariyam Solaaha)

**5.2 Committees**
- List of five committees with their mandate
- Committees: Outreach, Ethics, Development, Event, Frisbee at Entities
- Note chairperson application status

**5.3 How We're Governed**
- Paragraph: secret ballot election at AGM, 4-year terms
- Link to constitution/bylaws when available

**5.4 WFDF Membership**
- Explanation of Provisional Member status
- WFDF + AOFDF logos with external links
- Quote / Callout Block: paraphrased AOFDF letter of recommendation (`<blockquote>`, left border in accent colour)

**5.5 AGM Documents Table**

| Column | Notes |
|---|---|
| Document Name | Text |
| Date | Sortable |
| Download | File/Download Link component — PDF icon, file size optional, opens in new tab |

- PDFs served from `/public/documents/` — no third-party hosting
- Table: `<table>`, `<thead>`, `<th scope="col">`, `<td>` — no div-based layout
- Responsive: horizontal scroll acceptable given small column count
- Zebra striping for readability
- Accessible download links: `aria-label="Download AGM Minutes, December 2024 (PDF)"`

**Frontend requirements:**
- Governance documents: accessible, sortable by date
- Board card height consistent across all four cards

---

## 6. Play Page (`/play`)

**File:** `app/(site)/play/page.tsx`  
**Rendering:** Static (server component)

### Sections

**6.1 Hero / CTA**
- Welcoming, beginner-friendly tone: "Come play with us"
- Next session date/time (same hardcoded logic as home page Next Session block)

**6.2 Session Schedule Table**
- Columns: Day, Time, Location, Notes
- Rows: Tuesday evenings (Malé), Friday evenings (Malé)
- "Sessions have run every week for 113+ consecutive weeks"
- Note: Fuvahmulah and Addu City sessions when regular schedules exist
- **Must render without JavaScript** (pure server component)

**6.3 Where to Go**
- Location name, address, Google Maps link
- "What to bring" checklist: comfortable clothes, water, cleats optional

**6.4 It's Free to Try**
- First session is open — just show up
- Explanation of weekly session fee; link to `/pickup/payments`

**6.5 Beginner FAQ (Accordion)**
- 5 questions (data-driven — add more without JSX changes):
  1. Do I need to know the rules to join?
  2. Is it mixed gender?
  3. What fitness level do I need?
  4. How do I join the WhatsApp group?
  5. What happens if it rains?
- All-independent expand behaviour (multiple open simultaneously)
- Implemented with `<details>`/`<summary>` HTML elements — server-rendered, JS-optional
- Expand/collapse animation: CSS grid `grid-template-rows: 0fr → 1fr`
- Each trigger: minimum 44px height
- **Must work without JavaScript**

**6.6 Become a Member**
- Explanation of federation membership vs attending sessions
- CTA → Google Form (current process until Phase 3)
- Membership fee information

**Frontend requirements:**
- FAQ accordion: keyboard-accessible, JS-optional
- Schedule table: server component, no JS required

---

## 7. Rules Page (`/play/rules`)

**File:** `app/(site)/play/rules/page.tsx`  
**Rendering:** Static  
**Content:** Migrated from Notion — one-time copy

### Sections

1. Spirit of the Game — prominent, introductory
2. Basic rules overview (digestible summary, not full WFDF rulebook)
3. Callout Block: *"Ultimate is self-refereed. Spirit is everything."* (`<blockquote>`, left accent border)
4. "Read the full WFDF rulebook" — external link to wfdf.org

**Sidebar Table of Contents (desktop only)**
- Two-column layout at `lg:` breakpoint: TOC ~25% left, content ~75% right
- Sticky positioning; highlights currently visible section via `IntersectionObserver` on headings
- Smooth scroll to section on click
- Hidden on mobile — not rendered (not just visually hidden)

**Frontend requirements:**
- Long-form reading layout: max content width 720px, generous line height
- Print stylesheet: hide nav chrome and TOC (`@media print`)

---

## 8. Pickup Hub & Tools (`/pickup/*`)

### 8.1 Pickup Hub (`/pickup`)

**File:** `app/pickup/page.tsx`  
**Rendering:** Static

- Short explanation of pickup sessions vs the league
- Card links to Payment Tracker and Team Drafter (icon + title + description — no image needed)

---

### 8.2 Payment Status Tracker (`/pickup/payments`)

**File:** `app/pickup/payments/page.tsx`  
**Rendering:** Client Component (`'use client'`)  
**Data source:** Google Sheets published CSV or Sheets API (unchanged from current UFApayPLS)

**Requirements:**
- Search Input (full width, top of list, min 44px height)
  - `input type="search"`, placeholder "Search by name..."
  - Live filter on keystroke (client-side, no re-fetch)
  - Clear (×) button when value is present
- Player list with payment status badges (Paid / Unpaid / Partial)
  - **Payment badges are the most mobile-critical UI on the site** — test at 390px in bright sunlight
  - Skeleton loader while data loads
- Last updated timestamp
- "How to pay" instructions or link
- **Must function on mobile** — primary use case is players checking status at the field

---

### 8.3 Team Drafter (`/pickup/draft`)

**File:** `app/pickup/draft/page.tsx`  
**Rendering:** Client Component (`'use client'`)  
**State:** In-browser only (no backend)

**Requirements:**
- Player name input (add names manually or import from list)
- Team count Segmented Control: 2, 3, 4 — single selection; immediate update; touch-friendly
- "Randomise" button with inline Spinner during action
- "Copy teams to clipboard" → Toast confirmation
- "Clear teams" → Modal confirmation: *"Are you sure you want to clear all teams?"* (Cancel / Confirm)
- Works offline after initial page load

**Modal requirements:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title
- Focus trap; close on Escape
- Backdrop click does NOT close destructive confirm modals — require explicit button click
- Scale + fade-in animation (CSS only: 0.95 → 1.0)

---

## 9. Sponsors Page (`/sponsors`)

**File:** `app/(site)/sponsors/page.tsx`  
**Rendering:** Static  
**Phase 1 scope:** Structural placeholder — no live sponsor data required

**Sections:**
- "Partners & Supporters" heading
- Brief text on federation sponsorship offering
- Sponsor tier grid (structure present even if empty)
- Contact CTA → `/contact`

---

## 10. Contact Page (`/contact`)

**File:** `app/(site)/contact/page.tsx`  
**Rendering:** Server component shell; form is a Client Component leaf node

### Contact Form

**Fields:**
| Field | Type | Notes |
|---|---|---|
| Name | `text` | Required |
| Email | `email` | Required |
| Subject | `select` | Options: General Enquiry, Sponsorship, Media, Membership, Event Enquiry |
| Message | `textarea` | Required |

**Behaviour:**
- Visible `<label>` on all fields — no placeholder-only labels
- Inline validation errors on blur (not submit-only); `aria-describedby` linking errors to inputs
- Honeypot hidden field for basic bot prevention
- Submit: button shows Spinner during submission; Toast on success/error
- No page redirect on success — show inline confirmation
- **Do not use `<form>` element** — use `onClick` handler on submit button (per existing codebase constraint)

**API Route:** `POST /api/contact`
- Server-side field validation
- Email sent via Resend (or Nodemailer SMTP)
- Rate-limited: 5 submissions per IP per hour
- No Supabase write — email only
- Returns 200 success / 400 validation failure

**Other page content:**
- Social links: Instagram, TikTok
- Display email: `hello@frisbee.mv`

---

## 11. Phase 2 — Calendar Page (`/calendar`)

**File:** `app/(site)/calendar/page.tsx`  
**Rendering:** Server component (pre-loads current month data); `CalendarWidget.tsx` is Client Component  
**Data sources:** Google Sheets API (sessions), Supabase `events` + `session_overrides` tables

### CalendarWidget.tsx Requirements

**Layout:**
- Desktop: full month grid
- Mobile (< 640px): week strip with horizontal scroll
- Day cells: minimum 40px (slight exception to 44px rule; compensate with generous day-detail tap area)

**Session logic:**
- Sessions occur every Tuesday and Friday evening in Malé unless:
  - A `session_overrides` row exists for that date with `status = 'cancelled'`
  - Date is in the past with no corresponding Google Sheet row
- Future sessions shown as "Scheduled" for the next 4 weeks only

**Colour-coded day markers:**

| Colour | Meaning |
|---|---|
| Blue dot | Regular session |
| Orange dot | Tournament / event |
| Grey dot / strikethrough | Cancelled / no session |

**Interaction:**
- Day click: expand panel below (or popover) showing session type, time, location, event name
- Month navigation: previous/next arrows; triggers `/api/calendar?month=YYYY-MM` fetch
- `aria-live` region for dynamic content announcements

**API Route: `GET /api/calendar`**
- Query param: `month=YYYY-MM`
- Returns: `{ date: string, type: 'session' | 'event' | 'cancelled', label?: string, eventSlug?: string }[]`
- Data marshalled from Google Sheets cache + Supabase `events` + `session_overrides`

**Page sections below calendar:**
1. Upcoming list: next 4 session dates + upcoming events within 60 days (EventCard)
2. Past events: collapsible reverse-chronological list with links to event detail pages

**Build constraint:** No external calendar library — build the grid from scratch.

---

## 12. Phase 2 — Events Pages (`/events/*`)

### 12.1 Events List (`/events`)

**File:** `app/(site)/events/page.tsx`  
**Rendering:** Server component (`revalidate = 0`)  
**Data source:** Supabase `events` table

**Tabs (Upcoming / Past):**
- "Upcoming" default active; "Past" for archive
- `role="tablist"`, `role="tab"`, `role="tabpanel"`, `aria-selected`, `aria-controls`
- Full-width equal distribution on mobile
- Empty State in each panel when no events in that category

**EventCard component** (`app/_components/EventCard.tsx`):
- Cover image (from `cover_image_url`; fallback to disc/field placeholder)
- Event title
- Date formatted in MVT (`Indian/Maldives`)
- City / location tag
- Event type Badge
- Link to `/events/[slug]`
- `alt` text required on all images

**Frontend requirements:**
- Cover images from `photos.google.com` / `lh3.googleusercontent.com` — add to `next.config.ts` `images.remotePatterns`
- Lazy-load images below fold
- Empty state: "No upcoming events. Check back soon." with link to `/contact`

---

### 12.2 Event Detail (`/events/[slug]`)

**File:** `app/(site)/events/[slug]/page.tsx`  
**Rendering:** Server component (`revalidate = 0`)

**Sections:**
1. Event header — title, date, location, city, event type Badge
2. Description — plain text or markdown (if markdown: render via `marked` / `remark`)
3. Photo Gallery — if `photos_url` set: prominent "View Photos on Google Photos" CTA button (external link icon); if not set: "Photos coming soon" placeholder. **No gallery embedding in Phase 2.**
4. Related Events — 2–3 EventCards (same type or same year)

**Frontend requirements:**
- `notFound()` if slug doesn't exist or `is_published = false`
- OG image generation: extend `/api/og` route
- Structured data (`application/ld+json`) for event SEO
- Cover image: `placeholder="blur"` with low-res data URL (above the fold)

---

## 13. Phase 2 — News Section (`/news/*`)

### 13.1 News List (`/news`)

**File:** `app/(site)/news/page.tsx`  
**Rendering:** Server component (`revalidate = 0`)  
**Data source:** Supabase `news_posts` table

**Layout:** Grid of NewsCard components

**Filter tabs:** All | Announcements | Tournament Results | Federation Updates

**Pagination:**
- 12 posts per page
- Server-rendered with query params (`?page=2`) — each page is indexable
- Simple previous/next navigation
- `aria-label="Pagination navigation"`, current page `aria-current="page"`

**NewsCard component** (`app/_components/NewsCard.tsx`):
- Cover image (thumbnail)
- Headline
- Date + Author
- 2-line excerpt (truncated)
- Link to `/news/[slug]`

**Empty State:** Illustrated/icon empty state per tab — tailored message per context; alternative action CTA.

---

### 13.2 News Post (`/news/[slug]`)

**File:** `app/(site)/news/[slug]/page.tsx`  
**Rendering:** Server component (`revalidate = 0`)

**Sections:**
1. Title, author, published date, cover image
2. Body: Markdown rendered to HTML via `marked` or `remark` (no MDX, no rich text editor dependency)
3. "Back to News" link
4. Related posts: 2 most recent other posts
5. Social share: WhatsApp share link (`https://wa.me/?text=...`), copy link → Toast

**Frontend requirements:**
- Reading layout: max-width 720px, generous line height (mirrors Rules page)
- Code blocks not needed
- `notFound()` if slug invalid or post is a draft (`published_at` is null)
- OG image generation

---

## 14. Shared Component Library

All reusable components live in `app/_components/`. The table below is the canonical component inventory drawn from both specifications.

| Component | File | Phase | Notes |
|---|---|---|---|
| SkipLink | `SkipLink.tsx` | 1 | First element in `app/layout.tsx` |
| SiteNav | `SiteNav.tsx` | 1 | Sticky header, transparent on home hero |
| Drawer | `Drawer.tsx` | 1 | Mobile full-screen nav overlay |
| DropdownMenu | inline in SiteNav | 1 | Play sub-navigation |
| SiteFooter | `SiteFooter.tsx` | 1 | WFDF compliance statement required |
| Badge | `Badge.tsx` | 1 | 7 variants (see §2.6) |
| Button | `Button.tsx` | 1 | Primary, Secondary, Ghost, Destructive variants |
| Spinner | `Spinner.tsx` | 1 | Inline, for discrete async actions |
| Skeleton | `Skeleton.tsx` | 1 | Shimmer placeholder for data loading |
| Toast | `Toast.tsx` | 1 | Non-blocking feedback |
| Accordion | `Accordion.tsx` | 1 | `<details>`/`<summary>`, JS-optional |
| Table | `Table.tsx` | 1 | Semantic HTML table with responsive horizontal scroll |
| FileDownloadLink | `FileDownloadLink.tsx` | 1 | PDF icon + label + `aria-label` |
| Avatar | `Avatar.tsx` | 1 | Photo or initials fallback |
| PersonCard | `PersonCard.tsx` | 1 | Board member card (Avatar + bio) |
| QuoteBlock | `QuoteBlock.tsx` | 1 | `<blockquote>` with accent left border |
| StatTile | `StatTile.tsx` | 1 | Animated counter tile |
| SearchInput | `SearchInput.tsx` | 1 | Live filter; `type="search"` |
| SegmentedControl | `SegmentedControl.tsx` | 1 | 2/3/4 team selector |
| Modal | `Modal.tsx` | 1 | Destructive confirm only |
| CalendarWidget | `CalendarWidget.tsx` | 2 | `'use client'`, month grid |
| EventCard | `EventCard.tsx` | 2 | Cover image + metadata |
| NewsCard | `NewsCard.tsx` | 2 | Thumbnail + excerpt |
| Tabs | `Tabs.tsx` | 2 | Events upcoming/past; news filter |
| EmptyState | `EmptyState.tsx` | 2 | Contextual per section |
| Pagination | `Pagination.tsx` | 2 | News list; server-rendered with query params |

---

## 15. Accessibility Requirements

All components must meet the following before Phase 1 launch. These requirements apply globally.

| Requirement | Components Affected | Implementation |
|---|---|---|
| All interactive elements keyboard-reachable | SiteNav, Drawer, Accordion, Dropdown, Tabs, Modal, Forms, Calendar | Tab order follows DOM order; no unintentional keyboard traps |
| Focus trap in modals and Drawer | Drawer, Modal | Trap focus while open; restore on close |
| All images have `alt` text | Hero, EventCard, NewsCard, PersonCard/Avatar, WFDF/AOFDF logos | Decorative: `alt=""`. Informational: descriptive |
| Visible `<label>` on all form inputs | Contact form, Admin forms | `htmlFor` + `id` pairing; no placeholder-only labels |
| Focus ring visible on all focusable elements | All interactive components | `focus-visible` pseudo-class; never `outline: none` without replacement |
| WCAG AA contrast (4.5:1 body text) | All text, Badge text, Button text | Check accent orange on all backgrounds before finalising palette |
| Minimum 44×44px touch targets | Buttons, nav items, accordion triggers, all interactive elements | Use padding; exception: calendar day cells (40px minimum) |
| `aria-live` regions for dynamic content | Toast, Calendar navigation, Search results, Payment Tracker | `role="status"` + `aria-live="polite"` |
| Skip Link to `#main-content` | Global (`app/layout.tsx`) | First focusable element on every page |
| Semantic HTML tables | Governance documents, Session schedule | `<table>`, `<thead>`, `<th scope="col">`, `<td>` |
| ARIA roles for custom components | Modal, Drawer, Tabs, Dropdown | `role="dialog"`, `aria-modal`, `role="tablist"` etc. |

---

## 16. Frontend Conventions & Standards

### 16.1 Component Architecture

- All new public page components are **async Server Components** unless interactivity requires `'use client'`
- `'use client'` is pushed to leaf nodes only — never at the page level if avoidable
- Shared UI components: `app/_components/`
- Page-specific components: co-located alongside `page.tsx`

### 16.2 Image Handling

- Always use Next.js `<Image>` component — **never a bare `<img>` tag**
- Provide `width`, `height`, and `alt` on all images
- Above-the-fold images: `placeholder="blur"` with low-res data URL
- External image domains added to `next.config.ts` `images.remotePatterns`:
  - `photos.google.com`
  - `lh3.googleusercontent.com`

### 16.3 SEO — Required per Page

Every page must export `generateMetadata` returning:
- `title`: `"Page Title | frisbee.mv"`
- `description`: 120–160 characters
- `openGraph.title`, `openGraph.description`, `openGraph.image` (use `/api/og` for dynamic pages)

### 16.4 No-form Rule

Do not use HTML `<form>` elements in React components. Use `onClick` handlers on submit buttons. This is inherited from the existing codebase conventions.

### 16.5 Timezone

All dates and times displayed in **Maldives Time (MVT, UTC+5)**. IANA identifier: `Indian/Maldives`. No UTC conversion in the UI.

### 16.6 Data Fetching

| Route type | Pattern |
|---|---|
| Static pages (About, Governance, Rules) | Plain server component; revalidate on redeploy |
| Dynamic public pages (Home, Calendar, Events, News) | Server component; `export const revalidate = 0` |
| Interactive tools (Payment Tracker, Team Drafter) | Client Component (`'use client'`) |
| All writes | `/api/admin/*` routes, JWT-protected |

### 16.7 Config Files

Phase 1 static content is managed via JSON config files in `/config/`:

```
/config/
├── board.json        ← Board member data
├── committees.json   ← Committee list and mandates
├── documents.json    ← AGM documents (name, date, filename)
└── sponsors.json     ← Sponsor entries
```

These are imported by server components at request time. A proper admin UI is a Phase 2 concern.

---

*Maldives Flying Disc Federation · frisbee.mv Frontend Technical Requirements Specification v1.0 · March 2026*  
*Derived from: Technical Specification v1.0 + Frontend Component Specification v1.0*
