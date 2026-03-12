'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/app/_components/Button'
import { type Event } from '@/lib/events'

const EVENT_TYPES = ['tournament', 'social', 'clinic', 'agm', 'other'] as const

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface EventFormProps {
  initial?: Event
}

export default function EventForm({ initial }: EventFormProps) {
  const router = useRouter()
  const isEdit = !!initial

  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [eventType, setEventType] = useState<string>(initial?.event_type ?? 'social')
  const [startDate, setStartDate] = useState(initial?.start_date ?? '')
  const [endDate, setEndDate] = useState(initial?.end_date ?? '')
  const [location, setLocation] = useState(initial?.location ?? '')
  const [city, setCity] = useState(initial?.city ?? 'Malé')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [photosUrl, setPhotosUrl] = useState(initial?.photos_url ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.cover_image_url ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slugTouched) {
      setSlug(slugify(v))
    }
  }

  async function save(publish: boolean) {
    setError('')
    setLoading(true)
    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      event_type: eventType,
      start_date: startDate.trim(),
      end_date: endDate.trim() || null,
      location: location.trim() || null,
      city: city.trim() || 'Malé',
      description: description.trim() || null,
      photos_url: photosUrl.trim() || null,
      cover_image_url: coverImageUrl.trim() || null,
      is_published: publish,
    }

    try {
      let res: Response
      if (isEdit) {
        res = await fetch(`/api/admin/events/${initial!.event_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      if (res.ok) {
        router.push('/admin/events')
      } else {
        const data = await res.json() as { error?: string }
        setError(data.error ?? 'An error occurred')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this event? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/admin/events/${initial!.event_id}`, { method: 'DELETE' })
    router.push('/admin/events')
  }

  const inputClass =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent'
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="space-y-5">
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="sm:col-span-2">
          <label className={labelClass}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={inputClass}
            placeholder="Bodu Match 2025"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Slug *</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
            className={inputClass}
            placeholder="bodu-match-2025"
          />
          <p className="text-xs text-gray-400 mt-1">URL: /events/{slug || '…'}</p>
        </div>

        <div>
          <label className={labelClass}>Event Type *</label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className={inputClass}
          >
            {EVENT_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>City</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            placeholder="Malé"
          />
        </div>

        <div>
          <label className={labelClass}>Start Date *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>End Date (optional)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Location (optional)</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
            placeholder="Villingili Football Ground"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={inputClass}
            placeholder="Describe the event…"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Google Photos URL (optional)</label>
          <input
            type="url"
            value={photosUrl}
            onChange={(e) => setPhotosUrl(e.target.value)}
            className={inputClass}
            placeholder="https://photos.app.goo.gl/…"
          />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Cover Image URL (optional)</label>
          <input
            type="url"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            className={inputClass}
            placeholder="https://…"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button variant="secondary" loading={loading} onClick={() => save(false)}>
          {isEdit ? 'Save' : 'Save as Draft'}
        </Button>
        <Button variant="primary" loading={loading} onClick={() => save(true)}>
          {isEdit ? 'Save & Publish' : 'Save & Publish'}
        </Button>
        {isEdit && (
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </div>
  )
}
