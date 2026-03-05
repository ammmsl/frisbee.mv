'use client';

import { useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';
import ChartContainer from './ChartContainer';
import { fmtDateShort, fmtMoney } from '../_lib/utils';
import type { FinancialLedger } from '../_lib/types';

interface Props {
  ledger: FinancialLedger;
}

export default function FinancialBurnUpChart({ ledger }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartType | null>(null);

  const isEmpty =
    ledger.timeline.length === 0 ||
    (ledger.cumulativeCost === 0 && ledger.cumulativePaid === 0);

  useEffect(() => {
    if (!canvasRef.current || isEmpty) return;

    const labels = ledger.timeline.map((e) => fmtDateShort(e.date));
    const cumCosts = ledger.timeline.map((e) => e.cumulativeCost);
    const cumPaids = ledger.timeline.map((e) => e.cumulativePaid);

    const paidPointStyles = ledger.timeline.map((e) => (e.type === 'payment' ? 'star' : 'circle'));
    const paidPointRadii = ledger.timeline.map((e) => (e.type === 'payment' ? 7 : 2));
    const paidPointColors = ledger.timeline.map((e) =>
      e.type === 'payment' ? 'rgb(46, 125, 50)' : 'rgb(76, 175, 80)'
    );

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Total Owed',
              data: cumCosts,
              stepped: true,
              borderColor: 'rgb(239, 83, 80)',
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointStyle: 'circle',
              pointRadius: 2,
              pointBackgroundColor: 'rgb(239, 83, 80)',
              pointBorderColor: 'rgb(239, 83, 80)',
              pointHoverRadius: 6,
              fill: {
                target: 1,
                above: 'rgba(239, 83, 80, 0.12)',
                below: 'rgba(76, 175, 80, 0.12)',
              },
            },
            {
              label: 'Total Paid',
              data: cumPaids,
              stepped: true,
              borderColor: 'rgb(76, 175, 80)',
              backgroundColor: 'transparent',
              borderWidth: 2,
              pointStyle: paidPointStyles,
              pointRadius: paidPointRadii,
              pointBackgroundColor: paidPointColors,
              pointBorderColor: paidPointColors,
              pointHoverRadius: 8,
              fill: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            x: {
              ticks: { autoSkip: true, maxRotation: 45, minRotation: 0, font: { size: 9 } },
            },
            y: {
              beginAtZero: true,
              ticks: {
                callback: (value) => `${value} MVR`,
                font: { size: 10 },
              },
            },
          },
          plugins: {
            tooltip: {
              callbacks: {
                title: (items) => {
                  const idx = items[0].dataIndex;
                  const e = ledger.timeline[idx];
                  if (e.type === 'cost') return `${e.dateStr} — ${e.location}`;
                  return `${e.dateStr} — Payment`;
                },
                afterBody: (items) => {
                  const idx = items[0].dataIndex;
                  const e = ledger.timeline[idx];
                  if (e.type === 'cost') return [`Session cost: ${fmtMoney(e.amount)}`];
                  return [`Payment: ${fmtMoney(e.amount)}`, e.reference ? `Ref: ${e.reference}` : ''].filter(Boolean);
                },
              },
            },
            legend: {
              display: true,
              position: 'top',
              labels: { font: { size: 11 }, padding: 10, usePointStyle: true },
            },
          },
        },
      });
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [ledger, isEmpty]);

  return (
    <ChartContainer isEmpty={isEmpty} emptyMessage="No financial activity yet.">
      <canvas ref={canvasRef} />
    </ChartContainer>
  );
}
