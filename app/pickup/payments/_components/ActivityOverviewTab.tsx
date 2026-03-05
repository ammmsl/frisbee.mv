'use client';

import ActivityChart from './ActivityChart';
import { ATT } from '../_lib/constants';
import { parseDate } from '../_lib/utils';
import type { RawRow } from '../_lib/types';

interface Props {
  attRows: RawRow[];
  years: string[];
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export default function ActivityOverviewTab({ attRows, years, selectedYear, onYearChange }: Props) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = attRows.filter((r) => {
    const d = parseDate(r[ATT.DATE]);
    return d && d >= thirtyDaysAgo;
  }).length;

  // Years with actual sessions for this player
  const yearsWithSessions = years.filter((y) => {
    return attRows.some((r) => {
      const d = parseDate(r[ATT.DATE]);
      return d && d.getFullYear().toString() === y;
    });
  });

  return (
    <div className="space-y-6">
      {/* Year stat cards */}
      <div className="flex flex-wrap gap-3">
        {yearsWithSessions.map((y) => {
          const count = attRows.filter((r) => {
            const d = parseDate(r[ATT.DATE]);
            return d && d.getFullYear().toString() === y;
          }).length;
          return (
            <div
              key={y}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3 text-center min-w-[90px]"
            >
              <p className="text-2xl font-bold text-[var(--text-primary)]">{count}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{y} Sessions</p>
            </div>
          );
        })}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-3 text-center min-w-[90px]">
          <p className="text-2xl font-bold text-[var(--text-primary)]">{recentCount}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">Last 30 Days</p>
        </div>
      </div>

      {/* Year selector buttons */}
      {yearsWithSessions.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {yearsWithSessions.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => onYearChange(y)}
              className={`min-h-[44px] px-4 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] cursor-pointer ${
                selectedYear === y
                  ? 'bg-[var(--accent)] text-white'
                  : 'border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent)]'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Activity chart */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          Sessions per Month — {selectedYear}
        </h3>
        <ActivityChart attRows={attRows} selectedYear={selectedYear} />
      </div>
    </div>
  );
}
