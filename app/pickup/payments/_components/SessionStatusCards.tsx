import Badge from '@/app/_components/Badge';
import { SHORT_MONTHS } from '../_lib/constants';
import { fmtMoney } from '../_lib/utils';
import type { SessionEntry } from '../_lib/types';

interface SessionStatusCardsProps {
  sessions: SessionEntry[];
}

export default function SessionStatusCards({ sessions }: SessionStatusCardsProps) {
  if (sessions.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)] text-center py-4">No sessions found.</p>
    );
  }

  const recent = sessions.slice(-10);

  return (
    <div className="flex flex-wrap gap-2">
      {recent.map((s, i) => {
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
