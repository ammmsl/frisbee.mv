'use client'

import { useState } from 'react'
import NewsCard from '@/app/_components/NewsCard'
import type { NewsCategory } from '@/lib/events'

export interface NewsPostSummary {
  slug: string
  title: string
  summary: string
  author: string
  publishedAt: string
  coverImageUrl: string | null
  category: NewsCategory
}

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'news', label: 'News' },
  { key: 'research', label: 'Research' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function NewsFilter({ posts }: { posts: NewsPostSummary[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>('all')

  const filtered =
    activeTab === 'all' ? posts : posts.filter(p => p.category === activeTab)

  return (
    <div>
      {/* Filter tabs */}
      <div
        className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-none"
        role="tablist"
        aria-label="Filter news by category"
      >
        {TABS.map(tab => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
              activeTab === tab.key
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Posts grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-[var(--text-muted)] py-12">
          No {activeTab === 'all' ? '' : TABS.find(t => t.key === activeTab)!.label + ' '}posts yet.
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
