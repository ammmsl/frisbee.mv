# frisbee.mv — Technical Specification
## Phases 1 & 2: Consolidation, Credibility & Live Content

**Document version:** 1.0  
**Organisation:** Maldives Flying Disc Federation (MFDF)  
**Domain:** frisbee.mv  
**Stack:** Next.js · Vercel · Supabase (plain Postgres)  
**Timezone:** All times in Maldives Time (MVT, UTC+5). IANA identifier: `Indian/Maldives`  
**Status:** Ready for development  

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [Architecture Decisions](#2-architecture-decisions)
3. [Project Structure](#3-project-structure)
4. [Phase 1 — Consolidation & Credibility](#4-phase-1--consolidation--credibility)
5. [Phase 2 — Calendar & Media](#5-phase-2--calendar--media)
6. [Shared Frontend Standards](#6-shared-frontend-standards)
7. [Environment & Deployment](#7-environment--deployment)
8. [Out of Scope](#8-out-of-scope)

---

## 1. Overview & Goals

### 1.1 Context

The Maldives Flying Disc Federation (MFDF) is a newly incorporated national sports association, registered September 2024, and a provisional WFDF member. The federation has three operational tools currently hosted as separate GitHub Pages deployments and a League Tracker on Vercel. These must be consolidated under a single Next.js application at **frisbee.mv**.

The site serves two audiences simultaneously:

- **Internal community** — 167 players in Malé, Fuvahmulah, and Addu City who need session schedules, payment status, league data, and team tools.
- **External world** — WFDF, AOFDF, potential sponsors, local media, schools, and newcomers who need to see a credible national federation with active governance and programming.

### 1.2 Phase Goals

**Phase 1** — Replace the GitHub Pages deployments and establish the public-facing federation site. Everything needed to pass WFDF scrutiny and give the community a single URL.

**Phase 2** — Bring the site to life with dynamic content: a live session calendar built from real data, and event pages backed by Google Photos archives.

### 1.3 Existing Sub-sites to Migrate

| Sub-site | Current URL | Stack | Destination |
|---|---|---|---|
| Payment Status Tracker | ammmsl.github.io/UFApayPLS | Static HTML/JS + Google Sheet | `/pickup/payments` |
| League Tracker + Pick'em | Vercel deployment | Next.js 16 / Supabase | `/league/*`, `/pickem/*` |
| Team Drafter | ammmsl.github.io/TeamDraft | Static HTML/JS | `/pickup/draft` |

---

## 2. Architecture Decisions

### 2.1 Monorepo — One Next.js App

The League Tracker already runs on Next.js 16 (App Router) with Supabase as its Postgres backend, deployed on Vercel. **frisbee.mv is built as an extension of this same codebase**, not a separate application. The existing league routes become sub-paths of the new site root.

This means:
- One Vercel project, one deployment pipeline
- One Supabase database (new tables added, existing tables untouched)
- One `lib/db.ts` connection pool
- Shared `PublicNav` component extended with the new site's top-level navigation

### 2.2 Stack (Inherits from League Tracker)

| Concern | Choice |
|---|---|
| Framework | Next.js 16.1.6, App Router, TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Supabase — plain Postgres via `postgres` npm package |
| Auth | JWT in httpOnly cookie via `jose` + `bcryptjs` (admin only) |
| Deployment | Vercel (serverless functions) |
| Timezone | `Indian/Maldives` IANA identifier everywhere |

### 2.3 Hard Rules (Inherited, Apply Site-Wide)

1. All timestamps stored and displayed in MVT (`Indian/Maldives`). No UTC conversion in the UI.
2. All public pages are server-rendered. No client-side Supabase access.
3. All writes go through `/api/admin/*` routes protected by JWT middleware.
4. DB client uses `max: 1`, `ssl: 'require'`, `prepare: false` (Supabase pgBouncer).
5. `export const revalidate = 0` on all dynamic public pages.
6. Next.js 16 async params: always `const { param } = await params`.

### 2.4 Static vs Dynamic Pages

| Page type | Rendering | Revalidation |
|---|---|---|
| About, Governance, Rules, Contact | Static (`generateStaticParams` or plain server component) | On redeploy only |
| Home, Calendar, Events list | Server component | `revalidate = 0` |
| Event detail, News posts | Server component | `revalidate = 0` |
| League pages (existing) | Server component | `revalidate = 0` (existing rule) |
| Payment Tracker, Team Drafter | Client component (`'use client'`) | N/A — reads Google Sheet API or client-state only |

### 2.5 Phase 2 Data Sources

| Data | Source | Access method |
|---|---|---|
| Session history & schedule | Google Sheet (existing Payment Tracker backend) | Google Sheets API v4 (read-only, service account) |
| Event entries | `events` table in Supabase | Standard DB query |
| Event photos | Google Photos albums (URLs stored in Supabase) | Link-out only (no photo migration) |
| News posts | `news_posts` table in Supabase | Standard DB query |

---

## 3. Project Structure

The following shows the complete file tree after both Phase 1 and Phase 2 are complete. Existing league tracker files are shown for context but are **not modified** unless explicitly noted.

```
frisbee-mv/                          ← root of the unified Next.js project
│
├── app/
│   │
│   ├── layout.tsx                   ← MODIFIED: add site-wide metadata, font, global nav
│   ├── globals.css                  ← MODIFIED: add any new global tokens
│   ├── page.tsx                     ← REPLACED: new site home page
│   │
│   │── (site)/                      ← Route group for public federation pages
│   │   │                               (no effect on URL, just organises files)
│   │   ├── layout.tsx               ← SiteNav + SiteFooter wrapper
│   │   │
│   │   ├── about/
│   │   │   └── page.tsx             ← About / Our Story / Timeline
│   │   │
│   │   ├── governance/
│   │   │   └── page.tsx             ← Board bios, committees, election process,
│   │   │                               WFDF/AOFDF affiliation, AGM documents
│   │   │
│   │   ├── play/
│   │   │   ├── page.tsx             ← Join a session: schedule, locations, FAQ
│   │   │   └── rules/
│   │   │       └── page.tsx         ← Rules & Spirit of the Game (from Notion)
│   │   │
│   │   ├── calendar/                ← PHASE 2
│   │   │   └── page.tsx             ← Unified session + event calendar
│   │   │
│   │   ├── events/                  ← PHASE 2
│   │   │   ├── page.tsx             ← Events list (upcoming + past)
│   │   │   └── [slug]/
│   │   │       └── page.tsx         ← Event detail + photo gallery link
│   │   │
│   │   ├── news/                    ← PHASE 2
│   │   │   ├── page.tsx             ← News/announcements list
│   │   │   └── [slug]/
│   │   │       └── page.tsx         ← Individual news post
│   │   │
│   │   ├── sponsors/
│   │   │   └── page.tsx             ← Sponsors & partners
│   │   │
│   │   └── contact/
│   │       └── page.tsx             ← Contact form + social links
│   │
│   ├── pickup/                      ← Migrated GitHub Pages tools
│   │   ├── layout.tsx               ← PickupNav sub-header
│   │   ├── page.tsx                 ← Pickup hub: links to payments + draft
│   │   ├── payments/
│   │   │   └── page.tsx             ← Payment Status Tracker (rehosted)
│   │   └── draft/
│   │       └── page.tsx             ← Team Drafter (rehosted)
│   │
│   ├── league/                      ← EXISTING league tracker routes
│   │   ├── page.tsx                 ← League home (currently app/page.tsx — relocated)
│   │   ├── standings/page.tsx
│   │   ├── fixtures/page.tsx
│   │   ├── match/[matchId]/page.tsx
│   │   ├── teams/page.tsx
│   │   ├── team/[teamId]/page.tsx
│   │   ├── players/page.tsx
│   │   ├── player/[playerId]/page.tsx
│   │   └── spirit/page.tsx
│   │
│   ├── pickem/                      ← EXISTING Pick'em routes (relocated)
│   │   └── ...
│   │
│   ├── admin/                       ← EXISTING admin routes (unchanged)
│   │   └── ...
│   │
│   └── api/
│       ├── admin/                   ← EXISTING admin API routes (unchanged)
│       ├── health/route.ts          ← EXISTING
│       ├── og/route.tsx             ← EXISTING
│       ├── contact/route.ts         ← NEW: contact form submission handler
│       └── sheets/
│           └── sessions/route.ts   ← NEW (Phase 2): read-only Google Sheets proxy
│
├── _components/                     ← Shared UI components
│   ├── SiteNav.tsx                  ← NEW: top-level site navigation
│   ├── SiteFooter.tsx               ← NEW: site footer
│   ├── PublicNav.tsx                ← EXISTING: league sub-nav (kept, used within /league)
│   ├── AdminNav.tsx                 ← EXISTING: admin sub-nav (kept)
│   ├── CalendarWidget.tsx           ← NEW (Phase 2): interactive calendar display
│   ├── EventCard.tsx                ← NEW (Phase 2): event summary card
│   └── NewsCard.tsx                 ← NEW (Phase 2): news post card
│
├── lib/
│   ├── db.ts                        ← EXISTING (unchanged)
│   ├── auth.ts                      ← EXISTING (unchanged)
│   ├── standings.ts                 ← EXISTING (unchanged)
│   ├── schedule.ts                  ← EXISTING (unchanged)
│   ├── sheets.ts                    ← NEW (Phase 2): Google Sheets API client
│   └── events.ts                    ← NEW (Phase 2): event + news DB query helpers
│
├── proxy.ts                         ← EXISTING middleware (unchanged)
├── next.config.ts                   ← MODIFIED: add image domains for Google Photos
├── .env.local                       ← MODIFIED: add GOOGLE_SHEETS_* vars (Phase 2)
│
└── docs/
    ├── frisbee-mv-technical-spec-v1.0.md   ← this document
    ├── UFA-League-Tracker-Technical-Specification-v1.1.md
    ├── UFA-League-Tracker-Implementation-Plan-v1.2.md
    ├── UFA-Pickem-Technical-Specification-v1.2.md
    └── BUILD-PROGRESS.md
```

---

## 4. Phase 1 — Consolidation & Credibility

### 4.1 Deliverables

Phase 1 ships everything needed to retire the GitHub Pages deployments and present frisbee.mv as a credible national federation website. All content in Phase 1 is static or near-static — no new backend work required beyond the existing Supabase instance.

---

### 4.2 Site Navigation (`SiteNav`)

The top-level navigation is new and wraps the entire site. The existing `PublicNav` (league-specific) remains but is demoted to a sub-nav visible only within `/league/*`.

**`SiteNav` links:**

| Label | Route | Notes |
|---|---|---|
| frisbee.mv (logo/wordmark) | `/` | Always visible, links home |
| About | `/about` | |
| Play | `/play` | Dropdown: Join a Session, Rules |
| League | `/league` | Sub-nav activates on enter |
| Pickup | `/pickup` | Sub-nav activates on enter |
| News | `/news` | Phase 2 — include in nav now, page deferred |
| Contact | `/contact` | |

**Frontend requirements:**
- Sticky on scroll
- Mobile: hamburger menu with full-screen drawer
- Active state on current route segment
- WFDF and AOFDF logo badges visible in desktop nav or footer (not mobile nav)
- Transparent on home hero, solid background on all other pages

---

### 4.3 Home Page (`/`)

The home page replaces the current League Tracker home. The league home moves to `/league`.

**Sections, in order:**

1. **Hero**
   - Full-width, preferably a real action photo (to be supplied)
   - Headline: federation name and tagline
   - Two CTAs: "Join a Session" → `/play` and "View League" → `/league`
   - WFDF Provisional Member badge overlay

2. **Live Stats Bar**
   - Three stat tiles: Total Unique Players (167), Consecutive Weeks Active (113+), Total Attendances (3,481+)
   - These are hardcoded initially; Phase 3 can pull them from Supabase
   - Animated counter on scroll-into-view (client component)

3. **Next Session**
   - Hardcoded schedule logic: next Tuesday or Friday evening session in Malé
   - Show day, date, time, location
   - "Get directions" link (Google Maps)
   - Phase 2 replaces this with a live calendar query

4. **About Snippet**
   - 2–3 sentence description of the federation
   - "Learn more" → `/about`

5. **Latest News / Announcements** *(rendered even in Phase 1 as a placeholder)*
   - 3 cards in a horizontal scroll row on mobile, 3-column grid on desktop
   - Phase 1: static/dummy cards or empty state
   - Phase 2: live from `news_posts` table

6. **Social Proof Strip**
   - Instagram feed link (@frisbee.mv), TikTok link (@frisbee.mv)
   - WFDF and AOFDF affiliation logos with links

7. **Footer** (`SiteFooter`)
   - Navigation links, contact email, social links
   - Registered organisation statement: "Registered with the Commissioner of Sports, Republic of Maldives · WFDF Provisional Member"
   - Copyright

**Frontend requirements:**
- Hero image must be above the fold on all common mobile screen sizes (390px+)
- Stats bar must be horizontally scrollable on narrow screens without overflow
- No horizontal scroll on the page body

---

### 4.4 About Page (`/about`)

**Sections:**

1. **Page hero** — photo or illustrated header, page title

2. **Our Mission**
   - Short paragraph: making Ultimate mainstream across the Maldives, providing opportunities for player development

3. **Timeline**
   - Vertical timeline component (alternating left/right on desktop, single column on mobile)
   - Key dates:
     - 2018 — First games, University of Nottingham Malaysia graduates
     - January 2024 — Weekly sessions formalised (Tuesdays and Fridays)
     - January 2024 — First tournament (5v5, 49 players)
     - March 2024 — Federation founded
     - September 2, 2024 — Registered by Commissioner of Sports
     - October 2024 — Largest tournament (7v7, 72 players)
     - December 12, 2024 — First AGM and executive committee election
     - December 2024 — WFDF Provisional Membership application submitted
   - Expandable: add future milestones without code changes (data-driven)

4. **About the Sport**
   - Brief description of Ultimate Frisbee, Spirit of the Game
   - Link to `/play/rules`

5. **Where We Play**
   - Cities: Malé (primary), Fuvahmulah, Addu City
   - Simple map or styled city cards (not interactive map — Phase 3 concern)

**Frontend requirements:**
- Timeline must read cleanly on mobile in single-column layout
- No external map API calls in Phase 1

---

### 4.5 Governance Page (`/governance`)

This page serves both internal transparency and WFDF compliance.

**Sections:**

1. **Board of Directors**
   - Card grid: photo (optional), name, title, term, short bio
   - Members: President (Aishath Uraiba Asif), Vice President (Ahmed Naaif Mohamed), Treasurer (Mohamed Amsal), Secretary General (Mariyam Solaaha)

2. **Committees**
   - List of five committees with their mandate:
     - Outreach Committee
     - Ethics Committee
     - Development Committee
     - Event Committee
     - Frisbee at Entities Committee
   - Note that chairperson applications are open (or update when filled)

3. **How We're Governed**
   - Paragraph describing election process: registered members vote via secret ballot at AGM, 4-year terms
   - Link to constitution/bylaws if/when available

4. **WFDF Membership**
   - Explanation of WFDF Provisional Member status
   - WFDF and AOFDF logos with links
   - Quote from AOFDF letter of recommendation (paraphrased, not verbatim)

5. **AGM Documents**
   - Table or list of available documents:
     - AGM Notice (December 2024)
     - AGM Minutes (December 12, 2024)
   - Each row: document name, date, download link (PDF hosted in `/public/documents/`)
   - New rows added as future AGMs occur — no code change needed, just file + data update

**Frontend requirements:**
- Board cards: consistent card height regardless of bio length
- Documents table: accessible, sortable by date
- PDFs served from `/public/documents/` — no third-party hosting for governance docs

---

### 4.6 Play / Join a Session Page (`/play`)

This is the primary new-player acquisition page.

**Sections:**

1. **Hero / CTA**
   - "Come play with us" — welcoming, beginner-friendly tone
   - Next session date/time (same logic as home page Next Session block)

2. **Session Schedule**
   - Weekly recurring schedule table:
     - Tuesday evenings, Malé
     - Friday evenings, Malé
   - Note: Fuvahmulah and Addu City sessions (if/when they have regular schedules)
   - "Sessions have run every week for 113+ consecutive weeks"

3. **Where to Go**
   - Location name, address, Google Maps link
   - What to bring checklist: comfortable clothes, water, cleats optional

4. **It's Free to Try**
   - First session is open — just show up
   - Explain the weekly session fee and how payment works (link to `/pickup/payments`)

5. **Beginner FAQ**
   - Accordion component
   - Suggested questions:
     - Do I need to know the rules to join?
     - Is it mixed gender?
     - What fitness level do I need?
     - How do I join the WhatsApp group?
     - What happens if it rains?

6. **Become a Member**
   - Brief explanation of federation membership vs just attending sessions
   - CTA: link to Google Form (current process) until Phase 3 replaces it
   - Membership fee information

**Frontend requirements:**
- FAQ accordion must be keyboard-accessible
- Schedule section must render clearly without JavaScript (server component)

---

### 4.7 Rules Page (`/play/rules`)

Content migrated from Notion. One-time copy-in, formatted as a standard long-form page.

**Sections:**
- Spirit of the Game — prominent, introductory
- Basic rules overview (not the full WFDF rulebook — a digestible summary)
- "Read the full WFDF rulebook" — external link to wfdf.org
- Callout block: "Ultimate is self-refereed. Spirit is everything."

**Frontend requirements:**
- Long-form reading layout: max content width ~720px, generous line height
- Anchor links in a sticky sidebar table of contents (desktop only)
- Print-friendly (no nav chrome when printing)

---

### 4.8 Pickup Hub & Migrated Tools (`/pickup`)

#### 4.8.1 Pickup Hub (`/pickup`)

Simple landing page linking to the two tools.

- Short explanation of what pickup sessions are vs the league
- Card links to Payment Tracker and Team Drafter

#### 4.8.2 Payment Status Tracker (`/pickup/payments`)

**Current behaviour (UFApayPLS):** Reads a Google Sheet via a published CSV or Sheets API URL. Displays a list of players with their payment status for the current session period. Players can see if they owe for any sessions.

**Migration approach:**
- Port the existing HTML/JS logic into a Next.js Client Component (`'use client'`)
- Keep the Google Sheet as the backend (unchanged) — the component calls the same data source
- Wrap in the `SiteNav` layout so it looks like part of frisbee.mv
- No backend changes in Phase 1

**Frontend requirements:**
- Player list with status indicators (paid / unpaid / partial)
- Filter/search by name
- Last updated timestamp
- "How to pay" instructions or link
- Must work on mobile (the primary use case is players checking on their phone at the field)

#### 4.8.3 Team Drafter (`/pickup/draft`)

**Current behaviour (TeamDraft):** Takes a list of players and distributes them into balanced teams. Likely client-side only.

**Migration approach:**
- Port the existing HTML/JS into a Next.js Client Component
- All state remains in-browser (no backend)
- Wrap in `SiteNav` layout

**Frontend requirements:**
- Player input (add names or import from a list)
- Team count selector (2, 3, 4 teams)
- Randomise button with animation
- Copy teams to clipboard
- Works offline after initial load

---

### 4.9 Sponsors Page (`/sponsors`)

**Phase 1 scope:** Placeholder page that establishes the structure for future sponsor content.

**Sections:**
- "Partners & Supporters" heading
- Brief text on what the federation offers sponsors (community reach, events, jerseys, etc.)
- Sponsor tier grid (even if empty — shows structure)
- Contact CTA: "Interested in supporting us?" → `/contact`

---

### 4.10 Contact Page (`/contact`)

**Sections:**
- Contact form (name, email, subject dropdown, message)
- Subject options: General Enquiry, Sponsorship, Media, Membership, Event Enquiry
- Social links: Instagram, TikTok
- Email: `hello@frisbee.mv` (displayed, not the form submission target — form POSTs to `/api/contact`)

**API route — `POST /api/contact`:**
- Validates fields server-side
- Sends email via a transactional email provider (Resend or Nodemailer with SMTP)
- Returns 200 on success, 400 on validation failure
- Rate-limited: 5 submissions per IP per hour
- Does not write to Supabase — email only

**Frontend requirements:**
- Client-side validation with inline errors before submission
- Loading state on submit button
- Success confirmation message (no page redirect)
- Honeypot field for basic bot prevention

---

### 4.11 League Route Relocation

The existing league tracker currently serves from `/` (site root). In Phase 1, all league routes move to `/league/*`. This requires:

- Moving `app/page.tsx` → `app/league/page.tsx` (the league home)
- Moving all `app/standings/`, `app/fixtures/`, `app/match/`, etc. → `app/league/standings/`, etc.
- Moving `app/pickem/` → `app/pickem/` (stays at same path — no user-visible change)
- Updating all internal links within league components from `/standings` → `/league/standings`, etc.
- The existing `PublicNav` component links must be updated to reflect new paths
- 301 redirects from old paths to new paths in `next.config.ts` for any externally linked URLs

---

### 4.12 Phase 1 — Admin Additions

A minimal admin interface is needed to manage Phase 1 content. This extends the existing admin at `/admin`.

**New admin routes:**

| Route | Purpose |
|---|---|
| `/admin/site/governance` | Edit board member bios, add/remove committee members |
| `/admin/site/documents` | Upload AGM documents (PDF), manage document list |
| `/admin/site/sponsors` | Add/edit/remove sponsor entries |

**Implementation note:** For Phase 1, governance and sponsor content can be managed as JSON config files in `/config/` committed to the repo, edited manually. A proper admin UI for this content is a Phase 2 concern unless the team specifically needs non-developer editing.

---

### 4.13 Phase 1 Database Changes

Phase 1 adds no new database tables. The following config files are added to the repo:

```
/config/
├── board.json          ← Board member data (name, title, bio, photo path)
├── committees.json     ← Committee list and mandates
├── documents.json      ← AGM documents (name, date, filename)
└── sponsors.json       ← Sponsor entries (name, tier, logo, URL)
```

These are imported by the relevant server components at build/request time.

---

### 4.14 Phase 1 — Exit Criteria

Phase 1 is complete when all of the following pass:

- [ ] frisbee.mv resolves and serves the new home page
- [ ] All existing league tracker routes work at `/league/*`
- [ ] Pick'em works at `/pickem/*`
- [ ] Payment Tracker is live at `/pickup/payments` and reads its Google Sheet
- [ ] Team Drafter is live at `/pickup/draft`
- [ ] `/about`, `/governance`, `/play`, `/play/rules`, `/sponsors`, `/contact` all render correctly
- [ ] `SiteNav` is present and functional on all routes
- [ ] Mobile layout tested at 390px width — no horizontal overflow on any page
- [ ] Contact form submits successfully and sends email
- [ ] AGM documents downloadable from `/governance`
- [ ] All three GitHub Pages deployments are officially retired (repos archived or redirected)
- [ ] Old league tracker root URL (if previously used) redirects to `/league`

---

## 5. Phase 2 — Calendar & Media

### 5.1 Deliverables

Phase 2 makes the site feel alive. A real-data calendar replaces the hardcoded session display. Event pages with Google Photos galleries establish the media archive. A news section gives the federation a voice.

---

### 5.2 New Database Tables

All new tables follow the existing schema conventions: `uuid` PKs, `created_at` timestamps, no Supabase RLS.

#### `events`

```sql
CREATE TABLE events (
  event_id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,          -- URL slug e.g. 'bodu-match-2024'
  title           text NOT NULL,
  event_type      text NOT NULL,                 -- 'tournament' | 'social' | 'clinic' | 'agm' | 'other'
  start_date      date NOT NULL,
  end_date        date,                          -- NULL for single-day events
  location        text,
  city            text NOT NULL DEFAULT 'Malé',
  description     text,
  photos_url      text,                          -- Google Photos album URL
  cover_image_url text,                          -- Direct image URL for OG/card display
  is_published    boolean NOT NULL DEFAULT false,
  created_at      timestamptz DEFAULT now()
);
```

#### `news_posts`

```sql
CREATE TABLE news_posts (
  post_id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  title        text NOT NULL,
  summary      text NOT NULL,                    -- 1–2 sentence summary for cards
  body         text NOT NULL,                    -- Markdown content
  author       text NOT NULL DEFAULT 'MFDF',
  published_at timestamptz,                      -- NULL = draft
  cover_image_url text,
  created_at   timestamptz DEFAULT now()
);
```

#### `session_overrides`

Used to mark sessions as cancelled or renamed (e.g. "No session — public holiday") without modifying the Google Sheet.

```sql
CREATE TABLE session_overrides (
  override_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL UNIQUE,
  status       text NOT NULL,                    -- 'cancelled' | 'special'
  note         text,                             -- Display note e.g. "Independence Day"
  created_at   timestamptz DEFAULT now()
);
```

---

### 5.3 Google Sheets Integration (`lib/sheets.ts`)

The Payment Tracker uses a Google Sheet as its data store. Phase 2 reads from this same sheet (read-only) to power the calendar's session history.

**Authentication:** Google Service Account with Sheets API v4 read-only scope. Credentials stored in environment variables, never committed.

**New environment variables:**

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...              # Multi-line — escape newlines as \n in .env
GOOGLE_SHEETS_ID=...                # The spreadsheet ID from the existing Payment Tracker sheet
```

**`lib/sheets.ts` exports:**

```typescript
// Returns array of session dates from the Google Sheet
// Used to populate calendar with historical session data
export async function getSessionDates(): Promise<Date[]>

// Returns payment status for all players in the current period
// Used by /pickup/payments (replaces the client-side fetch in Phase 1)
export async function getPaymentStatus(): Promise<PlayerPaymentStatus[]>
```

**Caching:** Wrap Google Sheets calls in Next.js `unstable_cache` with a 5-minute TTL. The data doesn't need to be real-time.

---

### 5.4 Calendar Page (`/calendar`)

**Data sources:**
- Session schedule: Google Sheets (historical) + assumed recurring Tuesday/Friday evenings
- Events: `events` table in Supabase
- Session overrides/cancellations: `session_overrides` table

**Calendar logic:**

Sessions are always Tuesday and Friday evenings in Malé unless:
- A `session_override` row exists for that date with `status = 'cancelled'`
- The date is in the past and has no corresponding row in the Google Sheet session history (indicating it didn't happen)

Future sessions are shown as "Scheduled" for the next 4 weeks. Beyond that, only show confirmed events.

**Page sections:**

1. **Month view calendar widget** (`CalendarWidget.tsx`)
   - Desktop: full month grid
   - Mobile: week strip with horizontal scroll
   - Day types rendered as colour-coded dots:
     - Blue: regular session
     - Orange: tournament / event
     - Grey: cancelled / no session
   - Clicking a day opens a detail popover: session type, time, location, event name if applicable

2. **Upcoming list** (below the calendar)
   - Next 4 session dates with time and location
   - Any upcoming events within the next 60 days with event card

3. **Past events** (collapsible)
   - Reverse-chronological list of past events with link to event detail page

**Frontend requirements:**
- Calendar is a Client Component (interactive day selection)
- Initial render must be server-rendered with the current month's data pre-loaded
- No external calendar library dependency — build the grid from scratch (it is simple enough and avoids bundle size)
- Month navigation (prev/next) fetches new data client-side via `/api/calendar?month=YYYY-MM`

**New API route — `GET /api/calendar`:**
- Query param: `month=YYYY-MM`
- Returns: array of `{ date: string, type: 'session' | 'event' | 'cancelled', label?: string, eventSlug?: string }`
- Server-rendered data marshalled from Google Sheets cache + Supabase events + session_overrides

---

### 5.5 Events Pages

#### Events List (`/events`)

**Sections:**

1. **Upcoming Events** — cards for events with `start_date >= today` and `is_published = true`
2. **Past Events** — reverse-chronological grid, `start_date < today`

**`EventCard` component:**
- Cover image (from `cover_image_url`, fallback to a generic disc/field placeholder)
- Event title
- Date (formatted in MVT)
- City / location
- Event type badge
- Link to `/events/[slug]`

**Frontend requirements:**
- Image must have `alt` text
- Cover images fetched from Google Photos direct URLs — add `photos.google.com` and `lh3.googleusercontent.com` to `next.config.ts` `images.remotePatterns`
- Lazy load images below the fold
- Empty state: "No upcoming events. Check back soon." with a link to `/contact`

#### Event Detail (`/events/[slug]`)

**Data:** Single row from `events` table, keyed by `slug`.

**Sections:**

1. **Event header** — title, date, location, city, event type badge
2. **Description** — rendered from `description` field (plain text or markdown)
3. **Photo Gallery** — if `photos_url` is set:
   - Prominent "View Photos" button/card linking to the Google Photos album
   - Note: photos are not embedded in Phase 2 — link-out only
   - If no `photos_url`: "Photos coming soon" placeholder
4. **Related Events** — 2–3 cards for other events of the same type or same year

**Frontend requirements:**
- Generate OG image for social sharing (extend existing `/api/og` route or add new handler)
- `notFound()` if slug doesn't exist or `is_published = false`
- Structured data (`application/ld+json`) for event SEO

---

### 5.6 News Section (`/news`, `/news/[slug]`)

#### News List (`/news`)

- Grid of `NewsCard` components
- Filter tabs: All | Announcements | Tournament Results | Federation Updates
- Pagination: 12 posts per page, load more button (no URL-based pagination needed at this scale)
- Empty state for each filter

**`NewsCard` component:**
- Cover image
- Title
- Summary (1–2 sentences)
- Author + published date
- Link to `/news/[slug]`

#### News Post (`/news/[slug]`)

- Full post layout: title, author, date, cover image, body (Markdown rendered to HTML)
- Markdown rendering: use `marked` or `remark` — lightweight, no MDX needed
- "Back to News" link
- Related posts (2 most recent other posts)
- Social share buttons: WhatsApp (primary for Maldivian audience), copy link

**Frontend requirements:**
- Markdown body: same long-form reading layout as `/play/rules` (max-width 720px)
- Code blocks not needed — this is sports federation content, not a dev blog
- WhatsApp share link: `https://wa.me/?text=encodeURIComponent(title + url)`

---

### 5.7 Phase 2 Admin Additions

New admin routes for managing Phase 2 content. All protected by existing JWT middleware.

| Route | Purpose |
|---|---|
| `/admin/events` | List all events, toggle published status |
| `/admin/events/new` | Create event (form: all `events` table fields) |
| `/admin/events/[eventId]` | Edit event |
| `/admin/news` | List all news posts, toggle published status |
| `/admin/news/new` | Create news post (form + markdown editor) |
| `/admin/news/[postId]` | Edit news post |
| `/admin/calendar/overrides` | Add/remove session overrides (cancelled sessions, special notes) |

**Markdown editor for news posts:** Use a simple `<textarea>` with a live preview pane. No rich text editor dependency. Markdown is stored as-is in the `body` column and rendered at read time.

---

### 5.8 Phase 2 — Exit Criteria

Phase 2 is complete when all of the following pass:

- [ ] `/calendar` renders with correct session dates for the current and next month
- [ ] Cancelled sessions (from `session_overrides`) display as cancelled on the calendar
- [ ] Events appear on the calendar on their correct dates
- [ ] `/events` lists all published events, separated into upcoming and past
- [ ] At least one past event (Bodu Match 2024, Glow-in-the-dark event) is seeded and displays with a Google Photos link
- [ ] `/events/[slug]` renders correctly for a valid slug and returns 404 for invalid
- [ ] `/news` renders with at least one published post (AGM announcement or equivalent)
- [ ] `/news/[slug]` renders markdown body correctly
- [ ] Admin can create, edit, and publish events and news posts
- [ ] Admin can add session overrides
- [ ] Google Sheets API connection is live and session dates are loading from the sheet
- [ ] All new images are properly configured in `next.config.ts` remote patterns
- [ ] OG images are generated for event and news post pages
- [ ] Mobile layout tested at 390px — calendar widget is usable on mobile

---

## 6. Shared Frontend Standards

These standards apply to all new pages across both phases.

### 6.1 Design Language

The existing league tracker uses a dark theme (`bg-gray-950` page background, `bg-gray-900` cards). The public federation site extends this language but may use a lighter, more accessible palette for the primarily informational pages.

**Option A — Extend dark theme site-wide** (consistent, no theming complexity)  
**Option B — Light theme for `(site)/` routes, dark for `/league/*`** (cleaner for text-heavy pages, but adds complexity)

This decision should be made before Phase 1 development begins. The spec is written theme-agnostic.

**Regardless of theme choice:**
- Accent colour: disc-orange (`#FF6B35`) or existing green (`green-400`) — decide before Phase 1
- Typography: one display font (headings) + system stack (body)
- Minimum touch target size: 44×44px
- Colour contrast ratio: WCAG AA minimum (4.5:1 for body text)

### 6.2 Responsive Breakpoints

| Name | Width | Usage |
|---|---|---|
| Mobile | < 640px | Default — design mobile-first |
| Tablet | 640px–1024px | `sm:` Tailwind prefix |
| Desktop | > 1024px | `lg:` Tailwind prefix |

Primary user device: mobile (players checking the site at the field or on the go).

### 6.3 Component Conventions

- All new public page components are async Server Components unless interactivity requires `'use client'`
- Client Components are leaf nodes — push `'use client'` as far down the tree as possible
- Shared UI components live in `app/_components/`
- Page-specific components live alongside the page file (no separate `components/` directory)

### 6.4 Image Handling

- All images use Next.js `<Image>` component — never a bare `<img>` tag
- Provide `width`, `height`, and `alt` on all images
- Placeholder: `placeholder="blur"` with a low-res data URL for above-the-fold images
- External image domains added to `next.config.ts` as needed

### 6.5 SEO

Every page must export a `generateMetadata` function returning at minimum:
- `title` — page-specific, follows pattern `"Page Title | frisbee.mv"`
- `description` — 120–160 characters
- `openGraph.title`, `openGraph.description`, `openGraph.image` (use `/api/og` for dynamic pages)

### 6.6 Accessibility

- All interactive elements reachable by keyboard
- All images have `alt` text
- All form inputs have associated `<label>` elements
- Focus ring visible on all focusable elements
- No `outline: none` without a replacement focus indicator

---

## 7. Environment & Deployment

### 7.1 Environment Variables

Extends the existing league tracker `.env.local`. New variables for Phase 2 are marked.

```bash
# === EXISTING (unchanged) ===
DATABASE_URL=postgresql://...          # Supabase pooler, port 6543
JWT_SECRET=...
ADMIN_PASSWORD_HASH=...

# === NEW — Phase 1 ===
CONTACT_EMAIL_FROM=hello@frisbee.mv    # From address for contact form emails
CONTACT_EMAIL_TO=hello@frisbee.mv      # Destination for contact form submissions
RESEND_API_KEY=...                     # Transactional email (or SMTP vars if using Nodemailer)

# === NEW — Phase 2 ===
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...                 # Escape newlines as \n
GOOGLE_SHEETS_ID=...                   # Payment Tracker Google Sheet ID
```

### 7.2 Vercel Project Settings

- Custom domain: `frisbee.mv` pointed to Vercel via DNS A record and CNAME
- `www.frisbee.mv` → redirect to `frisbee.mv` (naked domain canonical)
- All environment variables set in Vercel dashboard for Production and Preview environments

### 7.3 Redirects (`next.config.ts`)

```typescript
async redirects() {
  return [
    // Old league tracker root → new league path
    { source: '/', destination: '/league', permanent: true }, // Only if root was previously league
    // Old fixture/standings paths → new paths under /league
    { source: '/standings', destination: '/league/standings', permanent: true },
    { source: '/fixtures', destination: '/league/fixtures', permanent: true },
    { source: '/teams', destination: '/league/teams', permanent: true },
    { source: '/team/:teamId', destination: '/league/team/:teamId', permanent: true },
    { source: '/players', destination: '/league/players', permanent: true },
    { source: '/player/:playerId', destination: '/league/player/:playerId', permanent: true },
    { source: '/match/:matchId', destination: '/league/match/:matchId', permanent: true },
    { source: '/spirit', destination: '/league/spirit', permanent: true },
  ]
}
```

Note: The root `/` redirect only applies if the old league tracker was the entry point. Once the new home page goes live, this redirect is removed.

---

## 8. Out of Scope

The following are explicitly not in Phase 1 or Phase 2. They are logged here to avoid scope creep during development.

| Feature | Reason deferred |
|---|---|
| Membership registration & management backend | Largest backend effort; existing Google Form works. Phase 3. |
| Online payment integration | Depends on membership backend. Phase 3. |
| Member portal / login | Depends on membership backend. Phase 3. |
| Dhivehi (Divehi) language version | Important for island outreach but no translator capacity yet. Future. |
| National team section | No national team fielded yet. Placeholder page acceptable. |
| Interactive maps (Mapbox/Google Maps embed) | Not needed at current scale. Phase 3 or later. |
| Embedded Google Photos galleries | Link-out is sufficient. Full embedding is a Phase 3 enhancement. |
| Automated WFDF census data export | Supabase member data will enable this when membership backend exists. Phase 3. |
| Push notifications for session reminders | WhatsApp group serves this function adequately. Future. |
| Custom CMS (Contentful, Sanity, etc.) | Overhead not justified at current scale. Supabase admin UI is sufficient. |

---

*Maldives Flying Disc Federation — frisbee.mv Technical Specification v1.0*  
*Prepared: March 2026*  
*Next document: Phase 3 Specification (Membership Management)*
