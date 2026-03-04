import Link from 'next/link'
import LogoutButton from '../../LogoutButton'
import EventForm from '../EventForm'

export const metadata = { title: 'New Event | Admin' }

export default function NewEventPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events" className="text-sm text-gray-500 hover:text-gray-900">← Events</Link>
          <h1 className="text-xl font-bold text-gray-900">New Event</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8">
        <EventForm />
      </main>
    </div>
  )
}
