'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TogglePublishedButton({
  postId,
  publishedAt,
}: {
  postId: string
  publishedAt: string | null
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const isPublished = !!publishedAt

  async function toggle() {
    setLoading(true)
    const newValue = isPublished ? null : new Date().toISOString()
    await fetch(`/api/admin/news/${postId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published_at: newValue }),
    })
    router.refresh()
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors
        ${isPublished
          ? 'border-green-500 text-green-700 hover:bg-green-50'
          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
        } disabled:opacity-50`}
    >
      {loading ? '…' : isPublished ? 'Published' : 'Draft'}
    </button>
  )
}
