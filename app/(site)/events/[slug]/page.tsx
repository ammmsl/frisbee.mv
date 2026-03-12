import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Badge from '@/app/_components/Badge'
import EventCard from '@/app/_components/EventCard'
import { formatMVTDate } from '@/app/_components/EventCard'
import { getEventBySlug, getRelatedEvents } from '@/lib/events'
import type { BadgeVariant } from '@/app/_components/Badge'

export const revalidate = 0

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return {}

  const description =
    event.description?.slice(0, 155) ??
    `${event.title} — an event by UFA`
  const ogImage =
    event.cover_image_url ??
    `/api/og?title=${encodeURIComponent(event.title)}&sub=frisbee.mv`

  return {
    title: `${event.title} | frisbee.mv`,
    description,
    openGraph: {
      title: event.title,
      description,
      images: [{ url: ogImage }],
    },
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateRange(startDate: string, endDate: string | null): string {
  if (!endDate || endDate === startDate) {
    return formatMVTDate(startDate)
  }
  const start = new Date(`${startDate}T00:00:00+05:00`)
  const end = new Date(`${endDate}T00:00:00+05:00`)
  const startFmt = start.toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    day: 'numeric',
    month: 'long',
  })
  const endFmt = end.toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `${startFmt} – ${endFmt}`
}

const badgeVariantMap: Record<string, BadgeVariant> = {
  tournament: 'wfdf',
  social: 'upcoming',
  clinic: 'upcoming',
  agm: 'past',
  other: 'past',
}

const eventTypeLabel: Record<string, string> = {
  tournament: 'Tournament',
  social: 'Social',
  clinic: 'Clinic',
  agm: 'AGM',
  other: 'Event',
}

function ExternalLinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  )
}

function PhotoIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const relatedEvents = await getRelatedEvents(event.event_id, event.event_type, 3)

  const dateStr = formatDateRange(event.start_date, event.end_date)
  const placeStr = event.location ? `${event.location}, ${event.city}` : event.city
  const badgeVariant = badgeVariantMap[event.event_type] ?? 'past'

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.start_date,
    endDate: event.end_date ?? event.start_date,
    location: {
      '@type': 'Place',
      name: event.location ?? 'Villingili Football Ground',
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressCountry: 'MV',
      },
    },
    organizer: {
      '@type': 'Organization',
      name: 'Ultimate Frisbee Association',
      url: 'https://frisbee.mv',
    },
    description: event.description ?? '',
  }

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* ── Event hero ── */}
      <section
        className="relative min-h-[240px] flex items-end"
        aria-label="Event header"
      >
        {/* Background: cover image or accent colour */}
        {event.cover_image_url ? (
          <div className="absolute inset-0">
            <Image
              src={event.cover_image_url}
              alt={event.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
          />
        )}

        {/* Hero content */}
        <div className="relative z-10 px-4 py-10 w-full">
          <div className="mx-auto max-w-3xl">
            <div className="mb-3">
              <Badge variant={badgeVariant}>{eventTypeLabel[event.event_type] ?? 'Event'}</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
              {event.title}
            </h1>
            <p className="text-white/85 text-sm sm:text-base">
              {dateStr} · {placeStr}
            </p>
          </div>
        </div>
      </section>

      {/* ── Content area ── */}
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-10">

        {/* ── Description ── */}
        {event.description && (
          <section aria-label="Event description">
            <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </section>
        )}

        {/* ── Photo Gallery ── */}
        <section aria-label="Event photos">
          {event.photos_url ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-[var(--accent)]">
                <PhotoIcon />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--text-primary)] mb-1">
                  Photos from this event
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Browse the full photo album on Google Photos.
                </p>
              </div>
              <a
                href={event.photos_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] shrink-0"
              >
                View Photos
                <ExternalLinkIcon />
              </a>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center">
              <div className="mx-auto mb-3 text-[var(--text-muted)] flex justify-center">
                <PhotoIcon />
              </div>
              <p className="text-sm text-[var(--text-muted)]">Photos coming soon.</p>
            </div>
          )}
        </section>

        {/* ── Related Events ── */}
        {relatedEvents.length > 0 && (
          <section aria-label="More events">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">More Events</h2>
            <div className="flex gap-5 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0">
              {relatedEvents.map(e => (
                <div key={e.event_id} className="shrink-0 w-[280px] lg:w-auto">
                  <EventCard
                    slug={e.slug}
                    title={e.title}
                    eventType={e.event_type}
                    startDate={e.start_date}
                    endDate={e.end_date}
                    city={e.city}
                    location={e.location}
                    coverImageUrl={e.cover_image_url}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Back link */}
        <div className="pt-2">
          <Link
            href="/events"
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
          >
            ← Back to Events
          </Link>
        </div>

      </div>
    </>
  )
}
