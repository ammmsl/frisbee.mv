'use client';

import { useRef, useState, useEffect } from 'react';
import Badge from '@/app/_components/Badge';
import { SHORT_MONTHS } from '../_lib/constants';
import { fmtMoney } from '../_lib/utils';
import type { SessionEntry } from '../_lib/types';

interface SessionStatusCardsProps {
  sessions: SessionEntry[];
}

const CARD_WIDTH = 72; // min-w-[72px]
const CARD_GAP = 8;    // gap-2 = 8px
const ROWS = 2;

export default function SessionStatusCards({ sessions }: SessionStatusCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    if (!containerRef.current) return;

    function measure() {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const perRow = Math.max(1, Math.floor((width + CARD_GAP) / (CARD_WIDTH + CARD_GAP)));
      setVisibleCount(perRow * ROWS);
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (sessions.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-4">No sessions found.</p>
    );
  }

  const visible = sessions.slice(-visibleCount);

  return (
    <div ref={containerRef} className="flex flex-wrap gap-2">
      {visible.map((s, i) => {
        const dateLabel = `${s.date.getDate()} ${SHORT_MONTHS[s.date.getMonth()]}`;
        const badgeVariant =
          s.status === 'paid' ? 'paid' : s.status === 'partial' ? 'partial' : 'unpaid';
        const badgeLabel = s.status === 'paid' ? 'Paid' : s.status === 'partial' ? 'Partial' : 'Unpaid';

        return (
          <div
            key={i}
            title={`${s.dateStr} — ${badgeLabel} — ${fmtMoney(s.amount)}`}
            className="flex flex-col items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 min-w-[72px] text-center"
          >
            <span className="text-xs font-medium text-[var(--text-primary)]">{dateLabel}</span>
            <Badge variant={badgeVariant}>{badgeLabel}</Badge>
            <span className="text-[10px] text-[var(--text-muted)]">{fmtMoney(s.amount)}</span>
          </div>
        );
      })}
    </div>
  );
}
