/**
 * Design tokens — frisbee.mv
 *
 * TypeScript mirror of the CSS custom properties defined in app/globals.css.
 * Use this file in JS/TS contexts where CSS variables are not accessible:
 *   - Chart.js dataset colors (MembershipCalculator, future analytics)
 *   - html2canvas export rendering (TeamDrafter)
 *   - Deterministic palette arrays (Avatar)
 *   - Any JS-driven inline style that references a design value
 *
 * Keep in sync with app/globals.css @theme and :root blocks.
 */

// ── Accent (pacific-blue) ────────────────────────────────────────────────────

export const accent = {
  base:  '#469BAF',  // --accent        — primary actions, links, focus rings
  hover: '#3a8899',  // --accent-hover  — hover state
  dark:  '#2f6e7a',  // --accent-dark   — active/pressed, text on light bg
  light: '#92C2CF',  // --accent-light  — tint, borders, passive indicators
  /** Transparent tint (10% opacity) for card/highlight backgrounds */
  tint10: 'rgba(70, 155, 175, 0.1)',
  /** Semi-transparent (70% opacity) for chart fills */
  fill70: 'rgba(70, 155, 175, 0.7)',
} as const;

// ── Semantic status colors ───────────────────────────────────────────────────

export const status = {
  success: '#15803d',  // green-700 — paid, upcoming, success toast
  error:   '#dc2626',  // red-600   — unpaid, cancelled, error toast
  warning: '#b45309',  // amber-700 — partial payment, warning
  neutral: '#374151',  // gray-700  — past events, neutral info
} as const;

// ── Surface / text / border ──────────────────────────────────────────────────

export const surface = {
  page:    '#ffffff',  // --bg-page
  surface: '#f9fafb',  // --bg-surface (gray-50)
} as const;

export const text = {
  primary: '#111827',  // --text-primary (gray-900)
  muted:   '#6b7280',  // --text-muted   (gray-500)
} as const;

export const border = '#e5e7eb';  // --border (gray-200)

// ── Avatar palette ───────────────────────────────────────────────────────────
// 8 colours — all pass WCAG AA with white foreground text.
// Deterministic assignment: charCode hash mod 8.

export const avatarPalette = [
  '#1d4ed8',  // blue-700    9.7:1 contrast with white
  '#7c3aed',  // violet-700  8.4:1
  '#be185d',  // pink-700    8.4:1
  '#0f766e',  // teal-700    7.2:1
  '#b45309',  // amber-700   7.0:1
  '#15803d',  // green-700   5.0:1
  '#b91c1c',  // red-700     7.5:1
  '#6d28d9',  // purple-700  8.0:1
] as const;

// ── Team draft palette ───────────────────────────────────────────────────────
// Used in TeamDrafter for team card styling and html2canvas export rendering.
// Team 0 uses the primary accent palette; teams 1–5 use distinct hues.

export const teamPalette = [
  {
    main:     `bg-[${accent.base}]`,
    light:    'bg-[#e0f2f7]',
    border:   `border-[${accent.light}]`,
    text:     `text-[${accent.dark}]`,
    active:   `border-[${accent.base}] ring-[${accent.light}]`,
    num:      `text-[${accent.base}]`,
    hex:      accent.base,
    hexLight: '#e0f2f7',
  },
  {
    main:     'bg-rose-600',
    light:    'bg-rose-50',
    border:   'border-rose-200',
    text:     'text-rose-700',
    active:   'border-rose-500 ring-rose-100',
    num:      'text-rose-400',
    hex:      '#e11d48',
    hexLight: '#fff1f2',
  },
  {
    main:     'bg-emerald-600',
    light:    'bg-emerald-50',
    border:   'border-emerald-200',
    text:     'text-emerald-700',
    active:   'border-emerald-500 ring-emerald-100',
    num:      'text-emerald-400',
    hex:      '#059669',
    hexLight: '#ecfdf5',
  },
  {
    main:     'bg-amber-600',
    light:    'bg-amber-50',
    border:   'border-amber-200',
    text:     'text-amber-700',
    active:   'border-amber-500 ring-amber-100',
    num:      'text-amber-400',
    hex:      '#d97706',
    hexLight: '#fffbeb',
  },
  {
    main:     'bg-violet-600',
    light:    'bg-violet-50',
    border:   'border-violet-200',
    text:     'text-violet-700',
    active:   'border-violet-500 ring-violet-100',
    num:      'text-violet-400',
    hex:      '#7c3aed',
    hexLight: '#f5f3ff',
  },
  {
    main:     'bg-cyan-600',
    light:    'bg-cyan-50',
    border:   'border-cyan-200',
    text:     'text-cyan-700',
    active:   'border-cyan-500 ring-cyan-100',
    num:      'text-cyan-400',
    hex:      '#0891b2',
    hexLight: '#ecfeff',
  },
] as const;

// ── Chart colors ─────────────────────────────────────────────────────────────
// Used in MembershipCalculator Chart.js datasets.

export const chart = {
  member: {
    line:   accent.base,   // Member cost line
    fill:   accent.fill70, // Member fill (bar chart)
  },
  guest: {
    line:   '#e5850a',  // Warm orange — distinct from accent
    fill:   'rgba(229, 133, 10, 0.7)',
  },
} as const;
