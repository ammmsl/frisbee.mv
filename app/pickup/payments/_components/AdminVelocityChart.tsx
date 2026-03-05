'use client';

import { useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';
import ChartContainer from './ChartContainer';
import { calculatePaymentVelocityChartData } from '../_lib/adminMetrics';
import type { AppData, Binning, TimePeriod } from '../_lib/types';

interface Props {
  data: AppData;
  timePeriod: TimePeriod | string;
  binning: Binning;
}

export default function AdminVelocityChart({ data, timePeriod, binning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartType | null>(null);

  const chartData = calculatePaymentVelocityChartData(data, timePeriod, binning);
  const isEmpty = !chartData.labels.length;
  const binningLabel = binning === 'daily' ? 'Daily' : binning === 'weekly' ? 'Weekly' : 'Monthly';

  useEffect(() => {
    if (!canvasRef.current || isEmpty) return;

    import('chart.js/auto').then(({ default: Chart }) => {
      if (!canvasRef.current) return;
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(canvasRef.current, {
        type: 'line',
        data: {
          labels: chartData.labels,
          datasets: [
            {
              label: `${binningLabel} Payment Velocity (Days)`,
              data: chartData.velocities,
              borderColor: 'rgba(255, 152, 0, 1)',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              borderWidth: 3,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: 'rgba(255, 152, 0, 1)',
              tension: 0.3,
              spanGaps: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Days' },
              ticks: { callback: (v) => `${Math.round(Number(v))} days` },
            },
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const v = ctx.parsed.y;
                  return ` Average: ${v !== null ? Math.round(v) + ' days' : 'No data'}`;
                },
              },
            },
          },
        },
      });
    });

    return () => { chartRef.current?.destroy(); chartRef.current = null; };
  }, [data, timePeriod, binning, isEmpty, binningLabel, chartData]);

  return (
    <ChartContainer isEmpty={isEmpty} emptyMessage="No velocity data for this period.">
      <canvas ref={canvasRef} />
    </ChartContainer>
  );
}
