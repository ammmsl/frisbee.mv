import Image from 'next/image'
import Link from 'next/link'

export interface NewsCardProps {
  slug: string
  title: string
  summary: string
  author: string
  publishedAt: string    // ISO string
  coverImageUrl?: string | null
}

function formatPublishedDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function NewsCard({
  slug,
  title,
  summary,
  author,
  publishedAt,
  coverImageUrl,
}: NewsCardProps) {
  return (
    <Link
      href={`/news/${slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] transition-colors hover:border-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {/* Cover image — 16:9 aspect ratio */}
      <div className="relative aspect-video w-full overflow-hidden">
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-semibold leading-snug text-[var(--text-primary)] line-clamp-2">
          {title}
        </p>
        <p className="flex-1 text-sm text-[var(--text-muted)] line-clamp-3">
          {summary}
        </p>
        <p className="mt-auto text-xs text-[var(--text-muted)]">
          {author} · {formatPublishedDate(publishedAt)}
        </p>
      </div>
    </Link>
  )
}
