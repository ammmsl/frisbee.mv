'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TogglePublishedButton({
  eventId,
  isPublished,
}: {
  eventId: string
  isPublished: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    await fetch(`/api/admin/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !isPublished }),
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
