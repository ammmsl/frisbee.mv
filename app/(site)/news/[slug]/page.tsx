import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { marked } from 'marked'
import { getPostBySlug, getRecentPosts } from '@/lib/events'
import NewsCard from '@/app/_components/NewsCard'
import CopyLinkButton from './CopyLinkButton'

export const revalidate = 0

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  const ogImage =
    post.cover_image_url ??
    `/api/og?title=${encodeURIComponent(post.title)}&sub=${encodeURIComponent(post.author)}`

  return {
    title: `${post.title} | frisbee.mv`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: [{ url: ogImage }],
    },
    other: {
      'article:published_time': post.published_at ?? '',
      'article:author': post.author,
    },
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPublishedDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('en-US', {
    timeZone: 'Indian/Maldives',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function WhatsAppIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function NewsPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const relatedPosts = await getRecentPosts(post.post_id, 2)
  const html = await Promise.resolve(marked(post.body))

  const publishedDate = post.published_at
    ? formatPublishedDate(post.published_at)
    : null

  const waShareUrl = `https://wa.me/?text=${encodeURIComponent(
    `${post.title} https://frisbee.mv/news/${post.slug}`,
  )}`

  return (
    <article className="mx-auto max-w-[720px] px-4 py-10">

      {/* Back link — appears before everything else */}
      <div className="mb-6">
        <Link
          href="/news"
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] rounded"
        >
          ← Back to News
        </Link>
      </div>

      {/* Cover image */}
      {post.cover_image_url && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl">
          <Image
            src={post.cover_image_url}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 720px) 100vw, 720px"
          />
        </div>
      )}

      {/* Post header */}
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 leading-tight">
          {post.title}
        </h1>
        <p className="text-sm text-[var(--text-muted)]">
          By {post.author}
          {publishedDate ? ` · ${publishedDate}` : ''}
        </p>
      </header>

      {/* Markdown body */}
      <div
        className="prose-content mb-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Share section */}
      <div className="border-t border-[var(--border)] pt-8 mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
          Share this post
        </p>
        <div className="flex flex-wrap gap-3">
          {/* WhatsApp */}
          <a
            href={waShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>

          {/* Copy link */}
          <CopyLinkButton />
        </div>
      </div>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section aria-label="More from UFA">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">More from UFA</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {relatedPosts.map(p => (
              <NewsCard
                key={p.post_id}
                slug={p.slug}
                title={p.title}
                summary={p.summary}
                author={p.author}
                publishedAt={p.published_at ?? p.created_at}
                coverImageUrl={p.cover_image_url}
              />
            ))}
          </div>
        </section>
      )}

    </article>
  )
}
