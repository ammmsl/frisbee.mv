'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '../../LogoutButton'
import NewsForm from '../NewsForm'
import { type NewsPost } from '@/lib/events'

export default function EditPostPage() {
  const params = useParams()
  const postId = params.postId as string

  const [post, setPost] = useState<NewsPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/admin/news/${postId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json() as Promise<NewsPost>
      })
      .then((data) => { setPost(data); setLoading(false) })
      .catch(() => { setError('Could not load post.'); setLoading(false) })
  }, [postId])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/news" className="text-sm text-gray-500 hover:text-gray-900">← News</Link>
          <h1 className="text-xl font-bold text-gray-900">Edit Post</h1>
        </div>
        <LogoutButton />
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {loading && <p className="text-gray-500">Loading…</p>}
        {error && <p className="text-red-600">{error}</p>}
        {post && <NewsForm initial={post} />}
      </main>
    </div>
  )
}
