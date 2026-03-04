'use client'

import { useState } from 'react'
import NewsCard from '@/app/_components/NewsCard'

export interface NewsPostSummary {
  slug: string
  title: string
  summary: string
  author: string
  publishedAt: string
  coverImageUrl: string | null
}

type Category = 'All' | 'Announcements' | 'Tournament Results' | 'Federation Updates'

const CATEGORIES: Category[] = ['All', 'Announcements', 'Tournament Results', 'Federation Updates']

function inferCategory(title: string): Exclude<Category, 'All'> {
  const t = title.toLowerCase()
  if (/member|announcement|official|federation|registered|wfdf/.test(t)) {
    return 'Announcements'
  }
  if (/result|tournament|match|champion|winner|season/.test(t)) {
    return 'Tournament Results'
  }
  return 'Federation Updates'
}

export default function NewsFilter({ posts }: { posts: NewsPostSummary[] }) {
  const [activeTab, setActiveTab] = useState<Category>('All')

  const filtered =
    activeTab === 'All' ? posts : posts.filter(p => inferCategory(p.title) === activeTab)

  return (
    <div>
      {/* Filter tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none"
        role="tablist"
        aria-label="Filter news by category"
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={activeTab === cat}
            onClick={() => setActiveTab(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
              activeTab === cat
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-12">
          No {activeTab === 'All' ? '' : activeTab + ' '}posts yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(post => (
            <NewsCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              summary={post.summary}
              author={post.author}
              publishedAt={post.publishedAt}
              coverImageUrl={post.coverImageUrl}
            />
          ))}
        </div>
      )}
    </div>
  )
}
