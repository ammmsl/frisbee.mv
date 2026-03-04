'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '../../LogoutButton'
import EventForm from '../EventForm'
import { type Event } from '@/lib/events'

export default function EditEventPage() {
  const params = useParams()
  const eventId = params.eventId as string

  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/events/${eventId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json() as Promise<Event>
      })
      .then((data) => { setEvent(data); setLoading(false) })
      .catch(() => { setError('Could not load event.'); setLoading(false) })
  }, [eventId])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events" className="text-sm text-gray-500 hover:text-gray-900">← Events</Link>
          <h1 className="text-xl font-bold text-gray-900">Edit Event</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {event && <EventForm initial={event} />}
      </main>
    </div>
  )
}
