'use client';

import { useEffect, useRef } from 'react';
import type { Chart as ChartType } from 'chart.js';
import ChartContainer from './ChartContainer';
import { calculateRetentionRateChartData } from '../_lib/adminMetrics';
import type { AppData, Binning, TimePeriod } from '../_lib/types';

interface Props {
  data: AppData;
  timePeriod: TimePeriod | string;
  binning: Binning;
}

export default function AdminRetentionChart({ data, timePeriod, binning }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<ChartType | null>(null);

  const chartData = calculateRetentionRateChartData(data, timePeriod, binning);
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
              label: `${binningLabel} Retention Rate (%)`,
              data: chartData.retentionRates,
              borderColor: 'rgba(156, 39, 176, 1)',
              backgroundColor: 'rgba(156, 39, 176, 0.1)',
              borderWidth: 3,
              pointRadius: 5,
              pointHoverRadius: 7,
              pointBackgroundColor: 'rgba(156, 39, 176, 1)',
              tension: 0.3,
              spanGaps: true,
              fill: true,
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
              max: 100,
              title: { display: true, text: 'Retention Rate (%)' },
              ticks: { callback: (v) => `${v}%` },
            },
          },
          plugins: {
            legend: { display: true, position: 'top' },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const v = ctx.parsed.y;
                  return ` Retention: ${v !== null ? v + '%' : 'No data'}`;
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
    <ChartContainer isEmpty={isEmpty} emptyMessage="No retention data for this period.">
      <canvas ref={canvasRef} />
    </ChartContainer>
  );
}
