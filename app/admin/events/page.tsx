import Link from 'next/link'
import sql from '@/lib/db'
import { type Event } from '@/lib/events'
import LogoutButton from '../LogoutButton'
import TogglePublishedButton from './TogglePublishedButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Events | Admin' }

async function getAllEvents(): Promise<Event[]> {
  const rows = await sql`
    SELECT
      event_id::text, slug, title, event_type, start_date::text, end_date::text,
      location, city, description, photos_url, cover_image_url, is_published, created_at::text
    FROM events
    ORDER BY start_date DESC
  `
  return rows as unknown as Event[]
}

export default async function AdminEventsPage() {
  const events = await getAllEvents()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <h1 className="text-xl font-bold text-gray-900">Events</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{events.length} event{events.length !== 1 ? 's' : ''}</p>
          <Link
            href="/admin/events/new"
            className="px-4 py-2 bg-[#FF6B35] text-white text-sm font-medium rounded-lg hover:bg-[#e55a27] transition-colors"
          >
            + New Event
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No events yet.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((event) => (
                  <tr key={event.event_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{event.title}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{event.event_type}</td>
                    <td className="px-4 py-3 text-gray-600">{event.start_date}</td>
                    <td className="px-4 py-3">
                      <TogglePublishedButton
                        eventId={event.event_id}
                        isPublished={event.is_published}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/events/${event.event_id}`}
                        className="text-[#FF6B35] hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
