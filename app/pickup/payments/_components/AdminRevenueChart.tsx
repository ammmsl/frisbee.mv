'use client';

import { useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';
import ChartContainer from './ChartContainer';
import type { AdminMetrics } from '../_lib/types';

interface Props {
  metrics: AdminMetrics;
}

export default function AdminRevenueChart({ metrics }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartType | null>(null);

  const isEmpty = !metrics.chartLabels?.length;
  const binningLabel =
    metrics.chartBinning === 'daily' ? 'Daily' :
    metrics.chartBinning === 'weekly' ? 'Weekly' : 'Monthly';

  useEffect(() => {
    if (!canvasRef.current || isEmpty) return;

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(canvasRef.current, {
        type: 'bar',
        data: {
          labels: metrics.chartLabels,
          datasets: [
            {
              type: 'bar',
              label: `${binningLabel} Revenue (MVR)`,
              data: metrics.chartRevenue,
              backgroundColor: 'rgba(76, 175, 80, 0.6)',
              borderColor: 'rgba(76, 175, 80, 1)',
              borderWidth: 1,
              yAxisID: 'y',
              borderRadius: 4,
            },
            {
              type: 'line',
              label: `${binningLabel} Attendance`,
              data: metrics.chartAttendance,
              borderColor: 'rgba(70, 155, 175, 1)',
              backgroundColor: 'rgba(70, 155, 175, 0.1)',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              yAxisID: 'y1',
              tension: 0.3,
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
              title: { display: true, text: 'Revenue (MVR)' },
              ticks: { callback: (v) => `${v} MVR` },
            },
            y1: {
              type: 'linear',
              position: 'right',
              beginAtZero: true,
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Attendance' },
            },
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const label = ctx.dataset.label || '';
                  const value = ctx.parsed.y;
                  return label.includes('Revenue') ? ` ${label}: ${(value ?? 0).toFixed(2)} MVR` : ` ${label}: ${value ?? 0}`;
                },
              },
            },
          },
        },
      });
    });

    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [metrics, isEmpty, binningLabel]);

  return (
    <ChartContainer isEmpty={isEmpty} emptyMessage="No revenue data for this period.">
      <canvas ref={canvasRef} />
    </ChartContainer>
  );
}
