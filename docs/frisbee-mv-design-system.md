# frisbee.mv — Design System

The canonical reference for all design decisions. When changing a design value, update it here and in `app/globals.css` (+ `lib/tokens.ts` for JS contexts) — nowhere else.

---

## Source Files

| File | Purpose |
|------|---------|
| `app/globals.css` | **Primary source of truth** — `@theme` block (Tailwind utilities) + `:root` CSS custom properties |
| `lib/tokens.ts` | TypeScript mirror — use in Chart.js, html2canvas, Avatar palette, any JS-driven inline style |

---

## Color System

### Accent — Pacific Blue

| Token | Value | CSS var | Tailwind class | Use |
|-------|-------|---------|----------------|-----|
| Base | `#469BAF` | `var(--accent)` | `bg-accent`, `text-accent` | Primary actions, links, active nav, focus rings |
| Hover | `#3a8899` | `var(--accent-hover)` | `bg-accent-hover` | Hover state on accent-filled elements |
| Dark | `#2f6e7a` | `var(--accent-dark)` | `bg-accent-dark`, `text-accent-dark` | Active/pressed state; text on light backgrounds |
| Light | `#92C2CF` | `var(--accent-light)` | `bg-accent-light` | Tints, passive borders, indicators |

**Previous accent:** `#FF6B35` (disc-orange) — replaced by pacific-blue for the current brand. Do not use.

**WCAG contrast vs. white:** `#469BAF` → ~3.2:1 (large text only). For body text on the accent colour, always use `#2f6e7a` (accent-dark, 4.7:1).

### Surface & Text

| Token | Value | CSS var | Use |
|-------|-------|---------|-----|
| Page background | `#ffffff` | `var(--bg-page)` | Body, modal backdrop |
| Surface | `#f9fafb` | `var(--bg-surface)` | Cards, inputs, secondary panels |
| Primary text | `#111827` | `var(--text-primary)` | Body copy, headings |
| Muted text | `#6b7280` | `var(--text-muted)` | Labels, captions, secondary info |
| Border | `#e5e7eb` | `var(--border)` | All dividers, card outlines, input borders |

### Semantic Status Colors

Used in Badge, Toast, and status indicators. Applied via Tailwind classes — not CSS variables — because semantic names are more readable.

| Role | Value | Tailwind | Contrast vs. white |
|------|-------|----------|-------------------|
| Success | `#15803d` | `bg-green-700` / `text-green-700` | 5.0:1 ✓ AA |
| Error | `#dc2626` | `bg-red-600` / `text-red-600` | 7.4:1 ✓ AAA |
| Warning | `#b45309` | `bg-amber-700` / `text-amber-700` | 7.0:1 ✓ AAA |
| Neutral | `#374151` | `bg-gray-700` / `text-gray-700` | 9.4:1 ✓ AAA |

### Dark Theme

Applied via `[data-theme="dark"]` on a page wrapper. Reserved for `/league/*` routes (future integration). Public site routes (`(site)/`, `pickup/`) are always light.

```css
--bg-page:    #030712;
--bg-surface: #111827;
--text-primary: #f9fafb;
--text-muted:   #9ca3af;
--border:       #1f2937;
```

---

## Typography

**Font:** Inter (variable), loaded via `next/font/google` in `app/layout.tsx`. Applied as `font-[family-name:var(--font-inter)]` on `<body>`. No external secondary font — system stack as fallback.

### Size Scale

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `xs` | 12px / 0.75rem | `text-xs` | Captions, timestamps, badge labels, export metadata |
| `sm` | 14px / 0.875rem | `text-sm` | Secondary body, nav items, metadata, form labels |
| `base` | 16px / 1rem | `text-base` | Primary body text |
| `lg` | 18px / 1.125rem | `text-lg` | Large body, button `lg` variant |
| `xl` | 20px / 1.25rem | `text-xl` | Card titles, sub-headings |
| `2xl` | 24px / 1.5rem | `text-2xl` | Section headings |
| `3xl` | 30px / 1.875rem | `text-3xl` | Page headings |
| `5xl` | 48px / 3rem | `text-5xl` | Hero stat numbers, display text |

### Weight Scale

| Value | Tailwind | Use |
|-------|----------|-----|
| 400 | `font-normal` | Body copy (default) |
| 500 | `font-medium` | Buttons, nav links, interactive labels |
| 600 | `font-semibold` | Card titles, badge text, section labels |
| 700 | `font-bold` | Headings, stat numbers |
| 900 | `font-black` | Hero display, export title (TeamDrafter) |

### Line Heights

| Value | Tailwind | Use |
|-------|----------|-----|
| 1.25 | `leading-tight` | Headings, hero text |
| 1.375 | `leading-snug` | Card titles with `line-clamp` |
| 1.5 | `leading-normal` | Default |
| 1.625 | `leading-relaxed` | Long-form UI text |
| 1.75 | `leading-loose` | Prose body text (`.prose-content`) |

**Prose max width:** `720px` (45rem) — applied on Rules page and news post bodies.

---

## Spacing & Layout

### Touch Targets
- **Minimum: 44×44px** on all interactive elements (buttons, nav links, form inputs)
- Achieved via `min-h-[44px]` + padding, not fixed dimensions
- **Exception:** Calendar day cells use 40px minimum (spec constraint, acceptable for dense grid)

### Container
- Max width: `max-w-7xl` (80rem)
- Horizontal padding: `px-4` (mobile) → `sm:px-6` (640px+) → `lg:px-8` (1024px+)
- Nav height: 64px (`h-16`); main content uses `pt-16` to clear the fixed nav

### Breakpoints (mobile-first)

| Name | Width | Prefix |
|------|-------|--------|
| Mobile | < 640px | *(none)* |
| Tablet | ≥ 640px | `sm:` |
| Desktop | ≥ 1024px | `lg:` |

Note: `md:` (768px) exists in Tailwind but is not used in this codebase — use `sm:` and `lg:` only for consistency.

---

## Border Radius

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `sm` | 6px | `rounded-md` | Nav hover pills, small UI elements |
| `md` | 8px | `rounded-lg` | **Primary** — buttons, inputs, dropdowns, toasts |
| `lg` | 12px | `rounded-xl` | Cards, modals, large panels |
| `full` | 9999px | `rounded-full` | Avatars, badge pills, circular icons |

---

## Shadows

Used sparingly — prefer borders for card definition.

| Token | Value | Tailwind | Use |
|-------|-------|----------|-----|
| `sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | `shadow-sm` | Nav bar (solid state) |
| `md` | standard 4px shadow | `shadow-md` | Dropdown panels |
| `lg` | standard 10px shadow | `shadow-lg` | Modals, toasts, elevated overlays |

---

## Interactive States

Every interactive element must include all three states:

```
hover → accent-hover (#3a8899)
active/pressed → accent-dark (#2f6e7a)
focus → 2px accent outline, 2px offset
```

### Focus Ring (universal)
```css
outline: 2px solid var(--accent);
outline-offset: 2px;
```
Applied globally via `:focus-visible` in `globals.css`. Also explicit on components:
```
focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]
```

### Hover Backgrounds (for ghost/text interactive elements)
- Light tint over white: `hover:bg-sky-50` / `active:bg-sky-100`
- Form focus: `focus:ring-2 focus:ring-[var(--accent)]`

---

## Transitions

All transitions are CSS-only — no JS animation library.

| Duration | Value | Tailwind | Use |
|----------|-------|----------|-----|
| Fast | 150ms | `duration-150` | Dropdown panels |
| Base | 200ms | `duration-200` | **Default** — hover/active color changes |
| Slow | 300ms | `duration-300` | Nav transitions, drawer open/close, image zoom |

Common patterns:
- `transition-colors duration-200` — default for hover/active state changes (most common)
- `transition-opacity duration-300` — drawer, modal fade
- `transition-transform duration-300` — image zoom on card hover

---

## Components: Design Decisions

### Button
4 variants — all share `min-h-[44px]` and `rounded-lg`:

| Variant | Background | Text | Hover bg |
|---------|-----------|------|----------|
| `primary` | `var(--accent)` | white | `var(--accent-hover)` |
| `secondary` | transparent | `var(--accent)` | `var(--accent)` (with white text) |
| `ghost` | transparent | `var(--accent)` | `sky-50` |
| `destructive` | `red-600` | white | `red-700` |

### Badge
7 variants. Status colours use Tailwind semantic names (not CSS variables) — readable and stable.

| Variant | Background | Text | Contrast |
|---------|-----------|------|----------|
| `wfdf` | `var(--accent)` | `gray-900` | 4.7:1 ✓ |
| `upcoming` | `green-700` | white | 5.0:1 ✓ |
| `past` | `gray-100` | `gray-700` | 9.4:1 ✓ |
| `cancelled` | `red-600` | white | 7.4:1 ✓ |
| `paid` | `green-700` | white | 5.0:1 ✓ |
| `unpaid` | `red-600` | white | 7.4:1 ✓ |
| `partial` | `amber-700` | white | 7.0:1 ✓ |

### Avatar
8-colour deterministic palette (charCode hash mod 8). All colours sourced from `lib/tokens.ts → avatarPalette`. All pass WCAG AA with white text.

### CalendarWidget
Dot indicator colours:
- Blue (`bg-accent`) — regular session
- Orange — tournament/event (Tailwind amber)
- Grey — cancelled/no session
- Purple — special event

Today highlight: `ring-2 ring-accent`

### TeamDrafter
6-team colour palette sourced from `lib/tokens.ts → teamPalette`. Team 0 uses the primary accent palette; teams 1–5 use semantically distinct Tailwind hues (rose, emerald, amber, violet, cyan).

### Charts (MembershipCalculator)
Chart colours sourced from `lib/tokens.ts → chart`:
- Member line: `accent.base` (`#469BAF`)
- Guest line: `#e5850a` (warm orange, distinct from accent)

---

## Hero Gradient

Home page and event fallback hero:
```css
linear-gradient(135deg, var(--accent) 0%, #498EAD 45%, var(--accent-dark) 100%)
```
`#498EAD` is a fixed midpoint — it is intentional and not a token. The endpoints use CSS variables so accent changes propagate automatically.

---

## Accessibility Rules

1. **WCAG AA minimum:** 4.5:1 for body text, 3:1 for large text (18px+ regular / 14px+ bold)
2. **Focus ring:** 2px `var(--accent)` outline, 2px offset — on every focusable element
3. **Touch targets:** 44×44px minimum (40px exception: calendar day cells)
4. **Skip link:** `#main-content` in every page via `app/layout.tsx`
5. **Images:** Always `alt` text; decorative images use `alt=""`; never bare `<img>` — always `<Image>`
6. **Semantic HTML:** Tables with `<thead>` and `<th scope="col">`; `<nav>`, `<main>`, `<header>`, `<footer>` landmarks
7. **ARIA:** `aria-live="polite"` on Toast; `aria-expanded` on Accordion; `aria-current="page"` on active nav link
8. **No `<form>` elements** (codebase constraint) — use `onClick` handlers on submit buttons

---

## Prose Styles (`.prose-content`)

Used for rendered markdown (news post body, rules page sections). Defined in `globals.css`.

- Font size: 1rem, line-height: 1.75
- H2: 1.5rem / bold, margin-top 2rem
- H3: 1.25rem / bold, margin-top 1.5rem
- Links: `var(--accent)`, underlined (offset 2px), underline removed on hover
- Blockquotes: 4px left border (`var(--accent)`), italic, muted text
- HR: 1px `var(--border)`, margin 2rem

---

## Animations

All animations are CSS-only (no JS animation library). JS-driven animations:
- **StatTile counter:** `requestAnimationFrame`, ~1.5s ease-out, fires once on 50% viewport intersection
- **Skeleton sweep:** CSS gradient animation, 1.5s infinite

CSS keyframes defined in `globals.css`:
- `@keyframes shuffle-blink` — TeamDrafter shuffle action (0.15s ease-in-out, opacity + scale)

---

## Changing the Accent Colour

To change the site accent colour, update **two places only**:

1. **`app/globals.css`** — update `--color-accent`, `--color-accent-hover`, `--color-accent-dark`, `--color-accent-light` in `@theme` AND in `:root`
2. **`lib/tokens.ts`** — update `accent.base`, `accent.hover`, `accent.dark`, `accent.light` and `chart.member.line` / `chart.member.fill`

Everything else — buttons, nav active state, focus rings, calendar highlights, EventCard placeholder, hero gradient endpoints — will update automatically.

*Last updated: 2026-03-12*
