import Link from 'next/link'
import LogoutButton from '../../LogoutButton'
import NewsForm from '../NewsForm'

export const metadata = { title: 'New Post | Admin' }

export default function NewPostPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/news" className="text-sm text-gray-500 hover:text-gray-900">← News</Link>
          <h1 className="text-xl font-bold text-gray-900">New Post</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <NewsForm />
      </main>
    </div>
  )
}
