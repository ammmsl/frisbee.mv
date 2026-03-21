'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const INTERVAL = 6000; // ms between slide advances

interface HeroCarouselProps {
  slides: string[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState<boolean[]>(Array(slides.length).fill(false));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || slides.length <= 1) return;
    const id = setInterval(
      () => setCurrent((c) => (c + 1) % slides.length),
      INTERVAL,
    );
    return () => clearInterval(id);
  }, [mounted, slides.length]);

  // Return null until client-side mount to avoid SSR/hydration mismatch
  if (!mounted || slides.length === 0) return null;

  function markLoaded(i: number) {
    setLoaded((prev) => {
      const next = [...prev];
      next[i] = true;
      return next;
    });
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {slides.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current && loaded[i] ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority={i === 0}
            onLoad={() => markLoaded(i)}
          />
        </div>
      ))}
    </div>
  );
}
