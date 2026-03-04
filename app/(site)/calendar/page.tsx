import type { Metadata } from 'next'
import Link from 'next/link'
import CalendarWidget from '@/app/_components/CalendarWidget'
import EventCard from '@/app/_components/EventCard'
import { getCalendarDays, getTodayMVT, addDays } from '@/lib/calendar'
import { getPublishedEvents } from '@/lib/events'
import { getNextNSessions } from '@/lib/session'
import PastEventsToggle from './PastEventsToggle'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Calendar | frisbee.mv',
  description:
    'Session and event calendar for the Maldives Flying Disc Federation. Weekly pickup sessions every Tuesday and Friday at Villingili Football Ground.',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function MapPinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CalendarPage() {
  // Current month string in MVT
  const now = new Date()
  const currentMonth = now.toLocaleDateString('en-CA', {
    timeZone: 'Indian/Maldives',
  }).slice(0, 7) // 'YYYY-MM'

  // Fetch initial calendar data directly (server-to-server — no HTTP round-trip)
  const initialDays = await getCalendarDays(currentMonth)

  // Fetch all published events for the "Coming Up" and "Past Events" sections
  const allEvents = await getPublishedEvents()
  const todayMVT = getTodayMVT()
  const sixtyDaysOut = addDays(todayMVT, 60)

  // Upcoming events: start_date in [today, today+60]
  const upcomingEvents = allEvents.filter(
    e => e.start_date >= todayMVT && e.start_date <= sixtyDaysOut,
  )

  // Past events: start_date < today, newest first
  const pastEvents = allEvents.filter(e => e.start_date < todayMVT)

  // Next 4 sessions
  const upcomingSessions = getNextNSessions(4)

  // Interleave sessions and upcoming events chronologically
  type UpcomingItem =
    | { kind: 'session'; dateStr: string; dayName: string; fullDate: string; time: string; location: string }
    | { kind: 'event'; event: (typeof allEvents)[0] }

  const sessionItems: UpcomingItem[] = upcomingSessions.map(s => ({
    kind: 'session',
    dateStr: s.dateStr,
    dayName: s.dayName,
    fullDate: s.fullDate,
    time: s.time,
    location: s.location,
  }))
  const eventItems: UpcomingItem[] = upcomingEvents.map(e => ({ kind: 'event', event: e }))

  const comingUp: UpcomingItem[] = [...sessionItems, ...eventItems].sort((a, b) => {
    const aDate = a.kind === 'session' ? a.dateStr : a.event.start_date
    const bDate = b.kind === 'session' ? b.dateStr : b.event.start_date
    return aDate < bDate ? -1 : aDate > bDate ? 1 : 0
  })

  return (
    <>
      {/* Page hero */}
      <section className="bg-[var(--accent)] py-12 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Calendar</h1>
          <p className="text-white/80">
            Sessions every Tuesday &amp; Friday · 5:30 PM · Villingili Football Ground, Malé
          </p>
        </div>
      </section>

      {/* ── Section 1: CalendarWidget ── */}
      <section className="py-10 px-4" aria-label="Monthly calendar">
        <div className="mx-auto max-w-3xl">
          <CalendarWidget initialMonth={currentMonth} initialDays={initialDays} />
        </div>
      </section>

      {/* ── Section 2: Coming Up ── */}
      <section
        className="py-10 px-4 border-t border-[var(--border)] bg-[var(--bg-surface)]"
        aria-label="Coming up"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Coming Up</h2>

          {comingUp.length === 0 ? (
            <p className="text-[var(--text-muted)]">Nothing scheduled in the next 60 days.</p>
          ) : (
            <ul className="space-y-3">
              {comingUp.map((item, i) => {
                if (item.kind === 'session') {
                  return (
                    <li
                      key={`session-${i}`}
                      className="flex items-start gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-page)] px-4 py-3"
                    >
                      {/* Date badge */}
                      <div className="shrink-0 w-10 text-center">
                        <span className="block text-xs font-semibold uppercase text-[var(--accent)]">
                          {item.dayName.slice(0, 3)}
                        </span>
                        <span className="block text-lg font-bold text-[var(--text-primary)] leading-tight">
                          {item.fullDate.split(' ')[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">
                          Pickup Session
                        </p>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                          <ClockIcon /> {item.time}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                          <MapPinIcon /> {item.location}
                        </p>
                      </div>
                    </li>
                  )
                }

                // Event item — use EventCard for consistency
                return (
                  <li key={`event-${item.event.event_id}`}>
                    <EventCard
                      slug={item.event.slug}
                      title={item.event.title}
                      eventType={item.event.event_type}
                      startDate={item.event.start_date}
                      endDate={item.event.end_date}
                      city={item.event.city}
                      location={item.event.location}
                      coverImageUrl={item.event.cover_image_url}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      {/* ── Section 3: Past Events ── */}
      {pastEvents.length > 0 && (
        <section className="py-10 px-4 border-t border-[var(--border)]" aria-label="Past events">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Past Events</h2>
            <PastEventsToggle events={pastEvents} />
          </div>
        </section>
      )}

      {/* Link to full events list */}
      <div className="py-6 px-4 border-t border-[var(--border)] bg-[var(--bg-surface)] text-center">
        <Link
          href="/events"
          className="text-sm font-medium text-[var(--accent)] hover:underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
        >
          View all events →
        </Link>
      </div>
    </>
  )
}
