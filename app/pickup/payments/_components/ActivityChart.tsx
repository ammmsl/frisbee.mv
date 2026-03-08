'use client';

import { useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';
import ChartContainer from './ChartContainer';
import { ATT, SHORT_MONTHS } from '../_lib/constants';
import { parseDate, parseMoney } from '../_lib/utils';
import type { RawRow } from '../_lib/types';

export type ChartFilter =
  | { kind: 'year'; year: string }
  | { kind: 'window'; days: number | 'all' };

export type ChartBinning = 'monthly' | 'weekly';

interface Props {
  attRows: RawRow[];
  filter: ChartFilter;
  binning: ChartBinning;
}

function getFilteredRows(attRows: RawRow[], filter: ChartFilter): RawRow[] {
  if (filter.kind === 'year') {
    return attRows.filter((r) => {
      const d = parseDate(r[ATT.DATE]);
      return d && d.getFullYear().toString() === filter.year;
    });
  }
  if (filter.days === 'all') return attRows;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - filter.days);
  return attRows.filter((r) => {
    const d = parseDate(r[ATT.DATE]);
    return d && d >= cutoff;
  });
}

function buildMonthlyBuckets(
  rows: RawRow[],
  filter: ChartFilter,
): { labels: string[]; counts: number[]; avgCosts: number[] } {
  if (filter.kind === 'year') {
    // Fixed Jan–Dec for the chosen year
    const stats = Array.from({ length: 12 }, () => ({ count: 0, totalCost: 0 }));
    rows.forEach((r) => {
      const d = parseDate(r[ATT.DATE]);
      if (d) {
        stats[d.getMonth()].count++;
        stats[d.getMonth()].totalCost += parseMoney(r[ATT.COST]);
      }
    });
    return {
      labels: [...SHORT_MONTHS],
      counts: stats.map((s) => s.count),
      avgCosts: stats.map((s) => (s.count ? parseFloat((s.totalCost / s.count).toFixed(2)) : 0)),
    };
  }

  // Window mode: span calendar months that appear in the data
  const map = new Map<string, { count: number; totalCost: number }>();
  rows.forEach((r) => {
    const d = parseDate(r[ATT.DATE]);
    if (!d) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!map.has(key)) map.set(key, { count: 0, totalCost: 0 });
    map.get(key)!.count++;
    map.get(key)!.totalCost += parseMoney(r[ATT.COST]);
  });
  const keys = [...map.keys()].sort();
  const labels = keys.map((k) => {
    const [yr, mo] = k.split('-');
    return `${SHORT_MONTHS[parseInt(mo) - 1]} ${yr}`;
  });
  const counts = keys.map((k) => map.get(k)!.count);
  const avgCosts = keys.map((k) => {
    const s = map.get(k)!;
    return s.count ? parseFloat((s.totalCost / s.count).toFixed(2)) : 0;
  });
  return { labels, counts, avgCosts };
}

function buildWeeklyBuckets(rows: RawRow[]): {
  labels: string[];
  counts: number[];
  avgCosts: number[];
} {
  const map = new Map<string, { count: number; totalCost: number; weekStart: Date }>();
  rows.forEach((r) => {
    const d = parseDate(r[ATT.DATE]);
    if (!d) return;
    // ISO week start = Monday
    const day = new Date(d);
    const dow = (day.getDay() + 6) % 7; // Mon=0 … Sun=6
    day.setDate(day.getDate() - dow);
    day.setHours(0, 0, 0, 0);
    const key = day.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, { count: 0, totalCost: 0, weekStart: day });
    map.get(key)!.count++;
    map.get(key)!.totalCost += parseMoney(r[ATT.COST]);
  });
  const keys = [...map.keys()].sort();
  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  const labels = keys.map((k) => fmt(map.get(k)!.weekStart));
  const counts = keys.map((k) => map.get(k)!.count);
  const avgCosts = keys.map((k) => {
    const s = map.get(k)!;
    return s.count ? parseFloat((s.totalCost / s.count).toFixed(2)) : 0;
  });
  return { labels, counts, avgCosts };
}

function emptyMessage(filter: ChartFilter): string {
  if (filter.kind === 'year') return `No session data for ${filter.year}.`;
  if (filter.days === 'all') return 'No session data found.';
  return `No session data in the last ${filter.days} days.`;
}

export default function ActivityChart({ attRows, filter, binning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartType | null>(null);

  const filtered = getFilteredRows(attRows, filter);
  const { labels, counts, avgCosts } =
    binning === 'weekly'
      ? buildWeeklyBuckets(filtered)
      : buildMonthlyBuckets(filtered, filter);

  const isEmpty = counts.every((c) => c === 0);

  useEffect(() => {
    if (!canvasRef.current || isEmpty) return;

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              type: 'bar',
              label: 'Sessions',
              data: counts,
              backgroundColor: 'rgba(70, 155, 175, 0.6)',
              borderColor: 'rgba(70, 155, 175, 1)',
              borderWidth: 1,
              borderRadius: 4,
              hoverBackgroundColor: 'rgba(70, 155, 175, 0.8)',
              yAxisID: 'y',
            },
            {
              type: 'line',
              label: 'Avg Cost (MVR)',
              data: avgCosts,
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.1)',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0.3,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: {
              ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 24 },
            },
            y: {
              type: 'linear',
              position: 'left',
              beginAtZero: true,
              ticks: { stepSize: 1 },
              title: { display: true, text: 'Sessions' },
            },
            y1: {
              type: 'linear',
              position: 'right',
              beginAtZero: true,
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Avg Cost (MVR)' },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.dataset.label || '';
                  const value = context.parsed.y;
                  return label.includes('Cost') ? ` ${label}: ${value} MVR` : ` ${label}: ${value}`;
                },
              },
            },
            legend: { display: true, position: 'top' },
          },
        },
      });
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attRows, filter, binning, isEmpty]);

  return (
    <ChartContainer isEmpty={isEmpty} emptyMessage={emptyMessage(filter)}>
      <canvas ref={canvasRef} />
    </ChartContainer>
  );
}
