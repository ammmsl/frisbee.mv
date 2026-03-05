import type { Metadata } from 'next'
import { getPublishedPosts } from '@/lib/events'
import NewsFilter from './NewsFilter'
import type { NewsPostSummary } from './NewsFilter'

export const revalidate = 0

export const metadata: Metadata = {
  title: 'News | frisbee.mv',
  description:
    'News and announcements from the Ultimate Frisbee Association — tournament results, federation updates, and community news.',
}

export default async function NewsPage() {
  const posts = await getPublishedPosts()

  const summaries: NewsPostSummary[] = posts.map(p => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    author: p.author,
    publishedAt: p.published_at ?? p.created_at,
    coverImageUrl: p.cover_image_url,
  }))

  return (
    <>
      {/* Page hero */}
      <section className="bg-[var(--accent)] py-12 px-4">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">News</h1>
          <p className="text-white/80">Updates from the Ultimate Frisbee Association.</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <NewsFilter posts={summaries} />
      </div>
    </>
  )
}
