'use client';

import { useState } from 'react';
import ActivityChart, { type ChartFilter, type ChartBinning } from './ActivityChart';
import { ATT } from '../_lib/constants';
import { parseDate } from '../_lib/utils';
import type { RawRow } from '../_lib/types';

interface Props {
  attRows: RawRow[];
  years: string[];
}

const SELECT_CLASS =
  'text-sm border border-[var(--border)] rounded-lg px-3 py-2 bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer';

function chartTitle(filter: ChartFilter, binning: ChartBinning): string {
  const gran = binning === 'weekly' ? 'Weekly' : 'Monthly';
  if (filter.kind === 'year') return `${gran} Sessions — ${filter.year}`;
  if (filter.days === 'all') return `${gran} Sessions — All Time`;
  return `${gran} Sessions — Last ${filter.days} Days`;
}

export default function ActivityOverviewTab({ attRows, years }: Props) {
  // Years with actual sessions, sorted ascending
  const yearsWithSessions = years
    .filter((y) =>
      attRows.some((r) => {
        const d = parseDate(r[ATT.DATE]);
        return d && d.getFullYear().toString() === y;
      }),
    )
    .sort((a, b) => a.localeCompare(b));

  const defaultYear = yearsWithSessions[yearsWithSessions.length - 1] || '';

  const [filter, setFilter] = useState<ChartFilter>({ kind: 'year', year: defaultYear });
  const [binning, setBinning] = useState<ChartBinning>('monthly');
  // 'window' dropdown value — tracks separately so we can reflect 'none' when a year button is active
  const [windowValue, setWindowValue] = useState<string>('none');

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCount = attRows.filter((r) => {
    const d = parseDate(r[ATT.DATE]);
    return d && d >= thirtyDaysAgo;
  }).length;

  function handleYearButton(y: string) {
    setFilter({ kind: 'year', year: y });
    setWindowValue('none');
  }

  function handleWindowChange(val: string) {
    setWindowValue(val);
    if (val === 'none') {
      setFilter({ kind: 'year', year: defaultYear });
      return;
    }
    const days = val === 'all' ? 'all' : (parseInt(val) as number);
    setFilter({ kind: 'window', days });
  }

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
      {yearsWithSessions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {yearsWithSessions.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => handleYearButton(y)}
              className={`min-h-[44px] px-4 rounded-lg text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] cursor-pointer ${
                filter.kind === 'year' && filter.year === y
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
        {/* Chart header: title left, dropdowns right */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {chartTitle(filter, binning)}
          </h3>
          <div className="flex items-center gap-2">
            <select
              value={windowValue}
              onChange={(e) => handleWindowChange(e.target.value)}
              className={SELECT_CLASS}
              aria-label="Time window"
            >
              <option value="none" disabled hidden>
                Time Window
              </option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="180">Last 180 days</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </select>
            <select
              value={binning}
              onChange={(e) => setBinning(e.target.value as ChartBinning)}
              className={SELECT_CLASS}
              aria-label="Binning"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        <ActivityChart attRows={attRows} filter={filter} binning={binning} />
      </div>
    </div>
  );
}
