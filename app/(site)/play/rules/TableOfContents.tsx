'use client';

import { useEffect, useRef, useState } from 'react';

export interface TocSection {
  id: string;
  label: string;
}

interface TableOfContentsProps {
  sections: TocSection[];
}

export default function TableOfContents({ sections }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Build a map from id → entry for quick lookup
    const headingEntries = new Map<string, number>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          headingEntries.set(entry.target.id, entry.boundingClientRect.top);
        });

        // Pick the heading closest to the top of the viewport that is above the fold
        let closestId = '';
        let closestTop = Infinity;
        headingEntries.forEach((top, id) => {
          if (top >= 0 && top < closestTop) {
            closestTop = top;
            closestId = id;
          }
        });

        // Fall back to the last heading that has scrolled above the viewport
        if (!closestId) {
          let lastAboveId = '';
          let lastAboveTop = -Infinity;
          headingEntries.forEach((top, id) => {
            if (top < 0 && top > lastAboveTop) {
              lastAboveTop = top;
              lastAboveId = id;
            }
          });
          closestId = lastAboveId;
        }

        if (closestId) {
          setActiveId(closestId);
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [sections]);

  function handleClick(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <nav aria-label="Table of contents">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
        On this page
      </p>
      <ul className="list-none m-0 p-0 space-y-1">
        {sections.map(({ id, label }) => (
          <li key={id}>
            <button
              type="button"
              onClick={() => handleClick(id)}
              className={[
                'block w-full text-left text-sm py-1.5 px-2 rounded transition-colors min-h-[44px] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]',
                activeId === id
                  ? 'text-[var(--accent)] font-semibold bg-sky-50'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              ].join(' ')}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
