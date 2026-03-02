# frisbee.mv — Claude Code Orientation

This is the primary orientation file for Claude Code. Read this first, every session.

---

## What This Project Is

frisbee.mv is the website for the **Maldives Flying Disc Federation (MFDF)** — a national sports federation and provisional WFDF member. The site serves two audiences: the local player community (167 players) and external parties (WFDF, sponsors, media, newcomers).

**This is a standalone Next.js project.** It is not connected to the League Tracker codebase. The League Tracker is a separate project on a separate repo and deployment. Integration (shared domain, route merging) is deferred — do not design for it now.

**Current goal:** Get the site working locally, committed to git. Vercel deployment and domain setup happen later, manually.

---

## Key Documents

All planning documents are in `docs/`. Read the relevant one before starting any milestone.

| Document | Purpose |
|---|---|
| `docs/frisbee-mv-technical-spec-v1.0.md` | Architecture, data models, API routes, exit criteria |
| `docs/frisbee-mv-frontend-technical-spec-v1.0.md` | Component requirements, page specs, design decisions |
| `docs/frisbee-mv-frontend-implementation-plan-v1.0.md` | Milestone sequence, task list, dependency order |
| `docs/frisbee-mv-BUILD-PROGRESS.md` | **Current state — check this first every session** |
| `docs/UFA-League-Tracker-Technical-Specification-v1.1.md` | Existing league tracker spec (do not modify) |
| `docs/BUILD-PROGRESS.md` | League tracker build progress (reference only) |

---

## Hard Rules — Never Violate These

These are inherited from the league tracker and apply site-wide:

1. **All timestamps in MVT** — Maldives Time (UTC+5). IANA: `Indian/Maldives`. No timezone conversion in the UI.
2. **All public pages are server-rendered** — no client-side Supabase access. Database only via server components or API routes.
3. **All writes via `/api/admin/*`** — protected by existing JWT middleware in `proxy.ts`.
4. **DB client settings** — `max: 1`, `ssl: 'require'`, `prepare: false` (Supabase pgBouncer). Never change these.
5. **`revalidate = 0`** on all dynamic public pages (home, calendar, events, news, league pages).
6. **Next.js 16 async params** — always `const { param } = await params`. Never destructure directly.
7. **No `<form>` elements in React components** — use `onClick` handlers on submit buttons. This is an existing codebase constraint.
8. **Never bare `<img>` tags** — always Next.js `<Image>` component with `width`, `height`, `alt`.
9. **`'use client'` at leaf nodes only** — never at the page level unless the entire page is interactive. Push client components as far down the tree as possible.
10. **No external calendar library** — the CalendarWidget is built from scratch.
11. **No rich text editor dependency** — markdown stored as plain text, rendered at read time via `marked` or `remark`.

---

## Architecture

```
Stack:     Next.js 16 (App Router) · TypeScript · Tailwind CSS v4
Database:  Supabase (plain Postgres via `postgres` npm package)
Auth:      JWT in httpOnly cookie · `jose` + `bcryptjs` · admin only
Hosting:   Local dev → git → Vercel (manual, later)
```

**Route structure:**
```
app/
├── page.tsx                  ← Home page
├── (site)/                   ← Route group: public federation pages
│   ├── layout.tsx            ← SiteNav + SiteFooter wrapper
│   ├── about/
│   ├── governance/
│   ├── play/
│   │   └── rules/
│   ├── sponsors/
│   ├── contact/
│   ├── calendar/             ← Phase 2
│   ├── events/               ← Phase 2
│   └── news/                 ← Phase 2
├── pickup/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── payments/
│   └── draft/
├── admin/
└── api/
    ├── contact/
    ├── admin/
    └── sheets/               ← Phase 2
```

**Shared components:** `app/_components/`  
**Page-specific components:** co-located alongside `page.tsx`  
**Config data:** `config/*.json`  
**Governance PDFs:** `public/documents/`  
**Lib utilities:** `lib/` (db.ts, auth.ts, etc.)

---

## Design System

| Decision | Value |
|---|---|
| Theme | Light for `(site)/` and `pickup/` routes |
| Accent colour | `#FF6B35` (disc-orange) |
| Display font | Inter or DM Sans (variable, via `next/font`) |
| Body font | System stack |
| Min touch target | 44×44px (40px exception for calendar day cells) |
| Contrast | WCAG AA minimum (4.5:1 body text) |
| Breakpoints | Mobile-first · `sm:` 640px · `lg:` 1024px |

---

## What This Project Does NOT Include

- League tracker routes — separate project, separate repo
- Pick'em routes — separate project
- Any shared navigation with the league tracker
- Domain configuration — done manually later
- Vercel deployment — done manually later

Do not reference or import from the league tracker codebase.

---

## Config File Schemas

Static content for Phase 1 pages lives in `config/`. Imported by server components — no database needed for this content.

- `config/board.json` — board member data (name, title, term, bio, optional photo path)
- `config/committees.json` — committee list and mandates
- `config/documents.json` — AGM document list (filenames reference `public/documents/`)
- `config/sponsors.json` — sponsor entries

---

## Environment Variables

```bash
# Phase 1
DATABASE_URL=              # Supabase pooler, port 6543 (needed for admin)
JWT_SECRET=
ADMIN_PASSWORD_HASH=
CONTACT_EMAIL_FROM=hello@frisbee.mv
CONTACT_EMAIL_TO=hello@frisbee.mv
RESEND_API_KEY=

# Phase 2 (not needed until M6)
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=        # Escape newlines as \n
GOOGLE_SHEETS_ID=
```

---

## Session Start Checklist

At the start of every Claude Code session:

1. Read `docs/frisbee-mv-BUILD-PROGRESS.md` — understand current state
2. Identify the current milestone
3. Read the relevant section of the frontend spec before building any component
4. Update `docs/frisbee-mv-BUILD-PROGRESS.md` after completing each task

---

*Last updated: March 2026*
