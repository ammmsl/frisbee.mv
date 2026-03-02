'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';

export interface StatTileProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
}

const DURATION_MS = 1500;

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function StatTile({
  value,
  label,
  prefix = '',
  suffix = '',
  icon,
}: StatTileProps) {
  const [displayed, setDisplayed] = useState(0);
  const tileRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = tileRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.disconnect();
          animate();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function animate() {
    const start = performance.now();

    function step(now: number) {
      const elapsed = now - start;
      const t = Math.min(elapsed / DURATION_MS, 1);
      const easedT = easeOut(t);
      setDisplayed(Math.round(easedT * value));

      if (t < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplayed(value);
      }
    }

    rafRef.current = requestAnimationFrame(step);
  }

  return (
    <div
      ref={tileRef}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-6 py-5 text-center min-w-[160px]"
    >
      {icon && (
        <div className="text-[var(--accent)] text-2xl" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
        {prefix}{displayed.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-[var(--text-muted)] font-medium">{label}</div>
    </div>
  );
}
