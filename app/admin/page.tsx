import Link from 'next/link'
import LogoutButton from './LogoutButton'

export const metadata = { title: 'Dashboard | Admin' }

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">UFA Admin</h1>
        <LogoutButton />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h2 className="text-lg font-semibold text-gray-700 mb-6">Content Management</h2>
        <nav className="space-y-3">
          <AdminLink href="/admin/events" label="Manage Events" description="Create, edit, and publish events" />
          <AdminLink href="/admin/news" label="Manage News" description="Write and publish news posts" />
          <AdminLink href="/admin/calendar/overrides" label="Session Overrides" description="Mark sessions as cancelled or special" />
        </nav>
      </main>
    </div>
  )
}

function AdminLink({ href, label, description }: { href: string; label: string; description: string }) {
  return (
    <Link
      href={href}
      className="block px-5 py-4 bg-white border border-gray-200 rounded-lg hover:border-[#469BAF]
                 hover:shadow-sm transition-all group"
    >
      <div className="font-semibold text-gray-900 group-hover:text-[#469BAF] transition-colors">{label}</div>
      <div className="text-sm text-gray-500 mt-0.5">{description}</div>
    </Link>
  )
}
