import type { Metadata } from 'next'
import Link from 'next/link'
import EventCard from '@/app/_components/EventCard'
import { getPublishedEvents } from '@/lib/events'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'Events | frisbee.mv',
  description:
    'Flying disc events in the Maldives — tournaments, social sessions, clinics, and federation milestones.',
}

export default async function EventsPage() {
  let allEvents: Awaited<ReturnType<typeof getPublishedEvents>> = []
  try {
    allEvents = await getPublishedEvents()
  } catch {
    // DB unavailable — renders "No upcoming events" fallback
  }

  const todayMVT = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Indian/Maldives',
  })

  // Upcoming: start_date >= today, sorted ascending
  const upcoming = allEvents
    .filter(e => e.start_date >= todayMVT)
    .sort((a, b) => (a.start_date < b.start_date ? -1 : 1))

  // Past: start_date < today, already desc from DB
  const past = allEvents.filter(e => e.start_date < todayMVT)

  return (
    <>
      {/* Page hero */}
      <section className="bg-[var(--accent)] py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Events</h1>
          <p className="text-white/80">
            Tournaments, socials, clinics, and federation milestones.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 space-y-14">

        {/* ── Upcoming Events ── */}
        <section aria-label="Upcoming events">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Upcoming Events</h2>

          {upcoming.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 py-10 text-center">
              <p className="text-[var(--text-muted)] mb-3">No upcoming events scheduled.</p>
              <p className="text-[var(--text-muted)] text-sm">
                Check back soon, or{' '}
                <Link
                  href="/contact"
                  className="text-[var(--accent)] underline hover:no-underline"
                >
                  contact us
                </Link>{' '}
                if you have questions.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map(event => (
                <EventCard
                  key={event.event_id}
                  slug={event.slug}
                  title={event.title}
                  eventType={event.event_type}
                  startDate={event.start_date}
                  endDate={event.end_date}
                  city={event.city}
                  location={event.location}
                  coverImageUrl={event.cover_image_url}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Past Events ── */}
        {past.length > 0 && (
          <section aria-label="Past events">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Past Events</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.map(event => (
                <EventCard
                  key={event.event_id}
                  slug={event.slug}
                  title={event.title}
                  eventType={event.event_type}
                  startDate={event.start_date}
                  endDate={event.end_date}
                  city={event.city}
                  location={event.location}
                  coverImageUrl={event.cover_image_url}
                />
              ))}
            </div>
          </section>
        )}

      </div>
    </>
  )
}
