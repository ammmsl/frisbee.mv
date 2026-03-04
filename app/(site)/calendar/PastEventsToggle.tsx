'use client'

import { useState } from 'react'
import EventCard from '@/app/_components/EventCard'
import type { Event } from '@/lib/events'

interface Props {
  events: Event[]
}

export default function PastEventsToggle({ events }: Props) {
  const [open, setOpen] = useState(false)

  if (events.length === 0) return null

  return (
    <div>
      {/* Mobile toggle button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="mb-4 w-full rounded-lg border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:hidden"
      >
        {open ? 'Hide past events' : `Show past events (${events.length})`}
      </button>

      {/* Content: hidden on mobile until toggled; always visible on sm+ */}
      <div className={`${open ? 'block' : 'hidden'} sm:block`}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
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
      </div>
    </div>
  )
}
