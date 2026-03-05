'use client';

import { useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';
import ChartContainer from './ChartContainer';
import { ATT, SHORT_MONTHS } from '../_lib/constants';
import { parseDate, parseMoney } from '../_lib/utils';
import type { RawRow } from '../_lib/types';

interface Props {
  attRows: RawRow[];
  selectedYear: string;
}

export default function ActivityChart({ attRows, selectedYear }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartType | null>(null);

  const stats = Array.from({ length: 12 }, () => ({ count: 0, totalCost: 0 }));
  attRows.forEach((r) => {
    const date = parseDate(r[ATT.DATE]);
    if (date && date.getFullYear().toString() === selectedYear) {
      const monthIdx = date.getMonth();
      stats[monthIdx].count++;
      stats[monthIdx].totalCost += parseMoney(r[ATT.COST]);
    }
  });

  const counts = stats.map((s) => s.count);
  const avgCosts = stats.map((s) => (s.count ? parseFloat((s.totalCost / s.count).toFixed(2)) : 0));
  const isEmpty = counts.every((c) => c === 0);

  useEffect(() => {
    if (!canvasRef.current || isEmpty) return;

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: [...SHORT_MONTHS],
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
  }, [attRows, selectedYear, isEmpty, counts, avgCosts]);

  return (
    <ChartContainer isEmpty={isEmpty} emptyMessage={`No session data for ${selectedYear}.`}>
      <canvas ref={canvasRef} />
    </ChartContainer>
  );
}
