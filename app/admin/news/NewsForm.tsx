'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { marked } from 'marked'
import Button from '@/app/_components/Button'
import { type NewsPost } from '@/lib/events'

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

interface NewsFormProps {
  initial?: NewsPost
}

export default function NewsForm({ initial }: NewsFormProps) {
  const router = useRouter()
  const isEdit = !!initial

  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [author, setAuthor] = useState(initial?.author ?? 'UFA')
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.cover_image_url ?? '')
  const [body, setBody] = useState(initial?.body ?? '')
  const [previewHtml, setPreviewHtml] = useState('')
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)

  function handleTitleChange(v: string) {
    setTitle(v)
    if (!slugTouched) {
      setSlug(slugify(v))
    }
  }

  useEffect(() => {
    const html = marked.parse(body) as string
    setPreviewHtml(html)
  }, [body])

  async function save(publish: boolean) {
    setError('')
    setLoading(true)
    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      summary: summary.trim(),
      body: body.trim(),
      author: author.trim() || 'UFA',
      cover_image_url: coverImageUrl.trim() || null,
      published_at: publish ? new Date().toISOString() : null,
    }

    try {
      let res: Response
      if (isEdit) {
        res = await fetch(`/api/admin/news/${initial!.post_id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch('/api/admin/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      if (res.ok) {
        router.push('/admin/news')
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
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/admin/news/${initial!.post_id}`, { method: 'DELETE' })
    router.push('/admin/news')
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

      <div>
        <label className={labelClass}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={inputClass}
          placeholder="UFA Granted WFDF Provisional Membership"
        />
      </div>

      <div>
        <label className={labelClass}>Slug *</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }}
          className={inputClass}
          placeholder="mfdf-wfdf-provisional-member"
        />
        <p className="text-xs text-gray-400 mt-1">URL: /news/{slug || '…'}</p>
      </div>

      <div>
        <label className={labelClass}>Summary * (1–2 sentences for cards)</label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          className={inputClass}
          placeholder="A brief summary that appears on news cards…"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className={inputClass}
            placeholder="UFA"
          />
        </div>
        <div>
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

      {/* Body editor with preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass + ' mb-0'}>Body (Markdown) *</label>
          {/* Mobile tab toggle */}
          <div className="flex lg:hidden gap-1">
            <button
              onClick={() => setTab('edit')}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors
                ${tab === 'edit' ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Edit
            </button>
            <button
              onClick={() => setTab('preview')}
              className={`px-3 py-1 text-xs rounded-full font-medium transition-colors
                ${tab === 'preview' ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-4">
          {/* Editor */}
          <div className={tab === 'preview' ? 'hidden lg:block' : ''}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className={inputClass + ' font-mono text-xs leading-relaxed resize-y'}
              placeholder="## Heading&#10;&#10;Write your post in Markdown…"
            />
          </div>

          {/* Preview */}
          <div className={tab === 'edit' ? 'hidden lg:block' : ''}>
            <div
              ref={previewRef}
              className="min-h-[300px] px-4 py-3 border border-gray-200 rounded-lg bg-gray-50
                         prose prose-sm max-w-none text-gray-900 overflow-auto"
              dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-gray-400">Preview will appear here…</p>' }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button variant="secondary" loading={loading} onClick={() => save(false)}>
          Save as Draft
        </Button>
        <Button variant="primary" loading={loading} onClick={() => save(true)}>
          {isEdit && initial!.published_at ? 'Save' : 'Publish Now'}
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
