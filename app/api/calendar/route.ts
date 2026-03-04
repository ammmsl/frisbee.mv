import { NextRequest, NextResponse } from 'next/server'
import { getSessionDates } from '@/lib/sheets'
import { getSessionOverrides } from '@/lib/events'
import sql from '@/lib/db'

export const dynamic = 'force-dynamic'

export type CalendarDay = {
  date: string           // 'YYYY-MM-DD'
  type: 'session' | 'event' | 'cancelled' | 'special'
  label?: string         // event title, override note, or undefined
  eventSlug?: string     // present only when type === 'event'
  time?: string          // '5:30 PM' for sessions
  location?: string      // 'Villingili Football Ground' for sessions
}

// Returns today's date in MVT as 'YYYY-MM-DD' (en-CA locale outputs YYYY-MM-DD)
function getTodayMVT(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Indian/Maldives' })
}

// Returns 'YYYY-MM-DD' N days after dateStr
function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + n)
  return date.toLocaleDateString('en-CA')
}

// Returns every day in a given 'YYYY-MM' month as 'YYYY-MM-DD' strings
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

// Returns true if the date (YYYY-MM-DD) is a Tuesday (2) or Friday (5)
function isTuesdayOrFriday(dateStr: string): boolean {
  const [y, m, d] = dateStr.split('-').map(Number)
  const day = new Date(y, m - 1, d).getDay()
  return day === 2 || day === 5
}

interface EventRow {
  start_date: string
  title: string
  slug: string
}

async function getEventsForMonth(fromDate: string, toDate: string): Promise<EventRow[]> {
  try {
    const rows = await sql`
      SELECT
        start_date::text,
        title,
        slug
      FROM events
      WHERE is_published = true
        AND start_date BETWEEN ${fromDate}::date AND ${toDate}::date
      ORDER BY start_date ASC
    `
    return rows as unknown as EventRow[]
  } catch {
    return []
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const month = searchParams.get('month')

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: 'month parameter required (format: YYYY-MM)' },
      { status: 400 }
    )
  }

  const today = getTodayMVT()
  const fourWeeksOut = addDays(today, 28)

  const allDays = getDaysInMonth(month)
  const firstDay = allDays[0]
  const lastDay = allDays[allDays.length - 1]

  // Fetch all three data sources in parallel
  const [sessionDates, overrides, events] = await Promise.all([
    getSessionDates(),
    getSessionOverrides(firstDay, lastDay),
    getEventsForMonth(firstDay, lastDay),
  ])

  const sessionDateSet = new Set(sessionDates)
  const result: CalendarDay[] = []

  // Step 1: Build session entries from recurring Tue/Fri schedule
  for (const date of allDays) {
    if (!isTuesdayOrFriday(date)) continue

    const isPast = date < today
    const isWithin4Weeks = date <= fourWeeksOut

    if (isPast) {
      // Only include if the session actually happened (confirmed in Google Sheet)
      if (sessionDateSet.has(date)) {
        result.push({
          date,
          type: 'session',
          time: '5:30 PM',
          location: 'Villingili Football Ground',
        })
      }
    } else if (isWithin4Weeks) {
      // Future sessions within 4 weeks are shown as scheduled
      result.push({
        date,
        type: 'session',
        time: '5:30 PM',
        location: 'Villingili Football Ground',
      })
    }
    // Beyond 4 weeks: not included
  }

  // Step 2: Apply session overrides
  for (const override of overrides) {
    const date = override.session_date
    const existingIdx = result.findIndex(d => d.date === date && d.type === 'session')

    if (override.status === 'cancelled') {
      const entry: CalendarDay = {
        date,
        type: 'cancelled',
        label: override.note ?? 'Session cancelled',
      }
      if (existingIdx >= 0) {
        result[existingIdx] = entry
      } else {
        result.push(entry)
      }
    } else if (override.status === 'special') {
      const entry: CalendarDay = {
        date,
        type: 'special',
        label: override.note ?? undefined,
      }
      if (existingIdx >= 0) {
        result[existingIdx] = entry
      } else {
        result.push(entry)
      }
    }
  }

  // Step 3: Add events (can coexist with sessions on the same date)
  for (const event of events) {
    result.push({
      date: event.start_date,
      type: 'event',
      label: event.title,
      eventSlug: event.slug,
    })
  }

  // Step 4: Sort by date ascending, then session/cancelled/special before event
  const typeOrder: Record<string, number> = {
    session: 0,
    cancelled: 0,
    special: 0,
    event: 1,
  }
  result.sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return (typeOrder[a.type] ?? 2) - (typeOrder[b.type] ?? 2)
  })

  return NextResponse.json(result)
}
