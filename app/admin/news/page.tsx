import Link from 'next/link'
import sql from '@/lib/db'
import { type NewsPost } from '@/lib/events'
import LogoutButton from '../LogoutButton'
import TogglePublishedButton from './TogglePublishedButton'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'News | Admin' }

async function getAllPosts(): Promise<NewsPost[]> {
  const rows = await sql`
    SELECT
      post_id::text, slug, title, summary, body, author,
      published_at::text, cover_image_url, created_at::text
    FROM news_posts
    ORDER BY created_at DESC
  `
  return rows as unknown as NewsPost[]
}

function formatMVT(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'Indian/Maldives',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default async function AdminNewsPage() {
  const posts = await getAllPosts()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-900">← Dashboard</Link>
          <h1 className="text-xl font-bold text-gray-900">News</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
          <Link
            href="/admin/news/new"
            className="px-4 py-2 bg-[#469BAF] text-white text-sm font-medium rounded-lg hover:bg-[#3a8899] transition-colors"
          >
            + New Post
          </Link>
        </div>

        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No posts yet.</p>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Title</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Author</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Published At (MVT)</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.post_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900 font-medium">{post.title}</td>
                    <td className="px-4 py-3 text-gray-600">{post.author}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {formatMVT(post.published_at)}
                    </td>
                    <td className="px-4 py-3">
                      <TogglePublishedButton
                        postId={post.post_id}
                        publishedAt={post.published_at}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/news/${post.post_id}`}
                        className="text-[#469BAF] hover:underline"
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
