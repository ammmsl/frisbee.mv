import Image from 'next/image'
import Link from 'next/link'
import Badge, { BadgeVariant } from './Badge'

export interface EventCardProps {
  slug: string
  title: string
  eventType: 'tournament' | 'social' | 'clinic' | 'agm' | 'other'
  startDate: string       // 'YYYY-MM-DD'
  endDate?: string | null
  city: string
  location?: string | null
  coverImageUrl?: string | null
}

// Returns a formatted date string using MVT timezone.
// For multi-day events: "14 September – 15 September 2024"
// For single-day events: "14 September 2024"
export function formatMVTDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00+05:00`)
  return date.toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatEventDateRange(startDate: string, endDate?: string | null): string {
  if (!endDate || endDate === startDate) {
    return formatMVTDate(startDate)
  }
  const start = new Date(`${startDate}T00:00:00+05:00`)
  const end = new Date(`${endDate}T00:00:00+05:00`)
  const startFormatted = start.toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    day: 'numeric',
    month: 'long',
  })
  const endFormatted = end.toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return `${startFormatted} – ${endFormatted}`
}

const badgeVariantMap: Record<EventCardProps['eventType'], BadgeVariant> = {
  tournament: 'wfdf',
  social: 'upcoming',
  clinic: 'upcoming',
  agm: 'past',
  other: 'past',
}

const eventTypeLabel: Record<EventCardProps['eventType'], string> = {
  tournament: 'Tournament',
  social: 'Social',
  clinic: 'Clinic',
  agm: 'AGM',
  other: 'Event',
}

// Disc icon placeholder SVG for cards without a cover image
function DiscIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className="opacity-40"
    >
      <circle cx="24" cy="24" r="19" stroke="white" strokeWidth="2.5" />
      <ellipse cx="24" cy="24" rx="19" ry="6" stroke="white" strokeWidth="2" />
    </svg>
  )
}

export default function EventCard({
  slug,
  title,
  eventType,
  startDate,
  endDate,
  city,
  location,
  coverImageUrl,
}: EventCardProps) {
  const badgeVariant = badgeVariantMap[eventType] ?? 'past'
  const dateStr = formatEventDateRange(startDate, endDate)
  const placeStr = location ? `${location}, ${city}` : city

  return (
    <Link
      href={`/events/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {/* Cover image — 16:9 aspect ratio */}
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--accent)]">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <DiscIcon />
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <Badge variant={badgeVariant}>{eventTypeLabel[eventType]}</Badge>
        </div>
        <p className="font-semibold leading-snug text-[var(--text-primary)] line-clamp-2">
          {title}
        </p>
        <p className="text-sm text-[var(--text-muted)]">{dateStr}</p>
        <p className="mt-auto text-xs text-[var(--text-muted)]">{placeStr}</p>
      </div>
    </Link>
  )
}
