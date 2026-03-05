'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchInput from '@/app/_components/SearchInput';

interface Props {
  users: string[];
  currentUser: string | null;
  onSelect: (name: string) => void;
  onClear: () => void;
}

export default function PlayerSearch({ users, currentUser, onSelect, onClear }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(currentUser || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync query when currentUser changes externally
  useEffect(() => {
    setQuery(currentUser || '');
  }, [currentUser]);

  const matches = query.trim()
    ? users.filter((u) => u.toLowerCase().includes(query.toLowerCase())).slice(0, 10)
    : [];

  function handleSelect(name: string) {
    setQuery(name);
    setShowSuggestions(false);
    onSelect(name);
    router.push(`?user=${encodeURIComponent(name)}`, { scroll: false });
  }

  function handleClear() {
    setQuery('');
    setShowSuggestions(false);
    onClear();
    router.push('?', { scroll: false });
  }

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex gap-2">
        <div className="flex-1">
          <SearchInput
            value={query}
            onChange={(val) => {
              setQuery(val);
              setShowSuggestions(true);
            }}
            placeholder="Search player name…"
          />
        </div>
        {currentUser && (
          <button
            type="button"
            onClick={handleClear}
            className="min-h-[44px] px-4 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] cursor-pointer whitespace-nowrap"
          >
            Clear
          </button>
        )}
      </div>

      {showSuggestions && matches.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-[var(--border)] bg-[var(--bg-page)] shadow-lg overflow-hidden">
          {matches.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => handleSelect(name)}
              className="w-full min-h-[44px] px-4 py-2.5 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-surface)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)] transition-colors cursor-pointer border-b border-[var(--border)] last:border-b-0"
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
