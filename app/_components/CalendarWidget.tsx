'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { CalendarDay } from '@/app/api/calendar/route'

export interface CalendarWidgetProps {
  initialMonth: string        // 'YYYY-MM'
  initialDays: CalendarDay[]  // pre-loaded by server
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

// Today's date string in MVT ('YYYY-MM-DD')
function getTodayMVT(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Indian/Maldives' })
}

// All days in a 'YYYY-MM' month as 'YYYY-MM-DD' strings
function getDaysInMonth(yearMonth: string): string[] {
  const [year, month] = yearMonth.split('-').map(Number)
  const days: string[] = []
  const date = new Date(year, month - 1, 1)
  while (date.getMonth() === month - 1) {
    days.push(date.toLocaleDateString('en-CA'))
    date.setDate(date.getDate() + 1)
  }
  return days
}

// Day of week offset for the first day of a month (0=Sun…6=Sat), used for
// the desktop grid's leading empty cells.
function getFirstDayOffset(yearMonth: string): number {
  const [year, month] = yearMonth.split('-').map(Number)
  return new Date(year, month - 1, 1).getDay()
}

// The 7 days (Mon–Sun) of the week that contains anchorDateStr
function getWeekDays(anchorDateStr: string): string[] {
  const [y, m, d] = anchorDateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const dayOfWeek = date.getDay() // 0=Sun, 1=Mon…6=Sat
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // distance to Monday
  const monday = new Date(y, m - 1, d + diff)
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const curr = new Date(monday)
    curr.setDate(monday.getDate() + i)
    days.push(curr.toLocaleDateString('en-CA'))
  }
  return days
}

// "March 2026" from 'YYYY-MM'
function formatMonthHeading(yearMonth: string): string {
  return new Date(`${yearMonth}-01T00:00:00+05:00`).toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    month: 'long',
    year: 'numeric',
  })
}

// "Tuesday, 4 March 2026" from 'YYYY-MM-DD'
function formatDetailDate(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00+05:00`).toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// Advance 'YYYY-MM' by delta months, returns new 'YYYY-MM'
function shiftMonth(yearMonth: string, delta: number): string {
  const [year, month] = yearMonth.split('-').map(Number)
  const d = new Date(year, month - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// ─── Dot config ───────────────────────────────────────────────────────────────

const DOT_CLASSES: Record<CalendarDay['type'], string> = {
  session: 'bg-blue-500',
  event: 'bg-[var(--accent)]',
  cancelled: 'bg-gray-400',
  special: 'bg-purple-500',
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DotIndicators({ entries }: { entries: CalendarDay[] }) {
  const visible = entries.slice(0, 3)
  return (
    <span className="mt-0.5 flex justify-center gap-0.5">
      {visible.map((e, i) => (
        <span key={i} className={`inline-block h-1.5 w-1.5 rounded-full ${DOT_CLASSES[e.type]}`} />
      ))}
    </span>
  )
}

const DESKTOP_DAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MOBILE_DAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Main component ───────────────────────────────────────────────────────────

export default function CalendarWidget({ initialMonth, initialDays }: CalendarWidgetProps) {
  const today = getTodayMVT()

  const [currentMonth, setCurrentMonth] = useState(initialMonth)
  const [days, setDays] = useState<CalendarDay[]>(initialDays)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // weekAnchor: the date whose week is shown on mobile
  const [weekAnchor, setWeekAnchor] = useState(today)

  // Group CalendarDay[] by date for O(1) lookup
  const dayMap = new Map<string, CalendarDay[]>()
  for (const entry of days) {
    const existing = dayMap.get(entry.date) ?? []
    existing.push(entry)
    dayMap.set(entry.date, existing)
  }

  const navigate = useCallback(async (delta: number) => {
    const newMonth = shiftMonth(currentMonth, delta)
    setLoading(true)
    setSelectedDate(null)

    try {
      const res = await fetch(`/api/calendar?month=${newMonth}`)
      if (res.ok) {
        const data: CalendarDay[] = await res.json()
        setDays(data)
        setCurrentMonth(newMonth)
        // On mobile, show the first week of the new month
        setWeekAnchor(`${newMonth}-01`)
      }
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  const selectDate = (date: string) => {
    setSelectedDate(prev => (prev === date ? null : date))
  }

  // ── Desktop grid ────────────────────────────────────────────────────────────

  const monthDays = getDaysInMonth(currentMonth)
  const firstOffset = getFirstDayOffset(currentMonth) // 0=Sun for US grid

  // ── Mobile week strip ────────────────────────────────────────────────────────

  const weekDays = getWeekDays(weekAnchor)

  // ── Shared day cell renderer ─────────────────────────────────────────────────

  function DayCell({
    dateStr,
    isCompact = false,
    mobileIndex,
  }: {
    dateStr: string
    isCompact?: boolean
    mobileIndex?: number
  }) {
    const dayNumber = parseInt(dateStr.split('-')[2], 10)
    const entries = dayMap.get(dateStr) ?? []
    const isToday = dateStr === today
    const isSelected = dateStr === selectedDate
    const hasCancelled = entries.some(e => e.type === 'cancelled')

    const cellBase = isCompact
      ? 'flex min-w-[40px] flex-1 flex-col items-center py-1.5 cursor-pointer select-none rounded-lg transition-colors'
      : 'flex min-h-[64px] flex-col items-center p-1 cursor-pointer select-none rounded-lg transition-colors'

    const cellColor = isSelected
      ? 'bg-[var(--accent)] text-white'
      : isToday
      ? 'ring-2 ring-[var(--accent)] ring-inset'
      : 'hover:bg-gray-100'

    return (
      <button
        type="button"
        onClick={() => selectDate(dateStr)}
        className={`${cellBase} ${cellColor}`}
        aria-label={dateStr}
        aria-pressed={isSelected}
      >
        {/* Mobile: abbreviated day name above number */}
        {isCompact && mobileIndex !== undefined && (
          <span className="text-[10px] text-[var(--text-muted)] mb-0.5">
            {MOBILE_DAY_HEADERS[mobileIndex]}
          </span>
        )}

        {/* Day number */}
        <span
          className={`text-sm font-medium leading-none ${
            hasCancelled ? 'line-through opacity-60' : ''
          } ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}
        >
          {dayNumber}
        </span>

        {/* Dot indicators */}
        {entries.length > 0 && <DotIndicators entries={entries} />}
      </button>
    )
  }

  // ── Selected day detail panel ────────────────────────────────────────────────

  const selectedEntries = selectedDate ? (dayMap.get(selectedDate) ?? []) : []

  return (
    <div className="w-full">
      {/* Month navigation header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-40"
          aria-label="Previous month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <h2 className="text-base font-semibold text-[var(--text-primary)]">
          {formatMonthHeading(currentMonth)}
        </h2>

        <button
          type="button"
          onClick={() => navigate(1)}
          disabled={loading}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg transition-colors hover:bg-gray-100 disabled:opacity-40"
          aria-label="Next month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Grid / strip wrapper — dims while loading */}
      <div className={loading ? 'pointer-events-none opacity-50' : ''}>

        {/* ── Mobile week strip (hidden on sm+) ── */}
        <div className="flex gap-1 sm:hidden">
          {weekDays.map((dateStr, i) => (
            <DayCell key={dateStr} dateStr={dateStr} isCompact mobileIndex={i} />
          ))}
        </div>

        {/* ── Desktop full month grid (hidden below sm) ── */}
        <div className="hidden sm:block">
          {/* Day-of-week headers */}
          <div className="mb-1 grid grid-cols-7 text-center">
            {DESKTOP_DAY_HEADERS.map(h => (
              <span key={h} className="py-1 text-xs font-medium text-[var(--text-muted)]">
                {h}
              </span>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {/* Leading empty cells */}
            {Array.from({ length: firstOffset }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {/* Day cells */}
            {monthDays.map(dateStr => (
              <DayCell key={dateStr} dateStr={dateStr} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Selected day detail panel ── */}
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: selectedDate ? '320px' : '0' }}
      >
        {selectedDate && (
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
            <p className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              {formatDetailDate(selectedDate)}
            </p>

            {selectedEntries.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">No sessions or events.</p>
            ) : (
              <ul className="space-y-2">
                {selectedEntries.map((entry, i) => (
                  <li key={i}>
                    {entry.type === 'session' && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm text-[var(--text-primary)]">
                          Pickup Session · {entry.time} · {entry.location}
                        </span>
                        <a
                          href="https://maps.app.goo.gl/QNpZ2nUpYoQwBTaH6"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[var(--accent)] underline hover:no-underline"
                        >
                          Get directions
                        </a>
                      </div>
                    )}

                    {entry.type === 'event' && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-[var(--text-primary)]">{entry.label}</span>
                        {entry.eventSlug && (
                          <Link
                            href={`/events/${entry.eventSlug}`}
                            className="shrink-0 text-xs text-[var(--accent)] underline hover:no-underline"
                          >
                            View event →
                          </Link>
                        )}
                      </div>
                    )}

                    {entry.type === 'cancelled' && (
                      <span className="text-sm text-red-600">{entry.label}</span>
                    )}

                    {entry.type === 'special' && (
                      <span className="text-sm text-purple-600">{entry.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Dot legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
        {[
          { color: 'bg-blue-500', label: 'Session' },
          { color: 'bg-[var(--accent)]', label: 'Event' },
          { color: 'bg-gray-400', label: 'Cancelled' },
          { color: 'bg-purple-500', label: 'Special' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}
