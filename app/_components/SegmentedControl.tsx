'use client';

import { KeyboardEvent, useRef } from 'react';

export interface SegmentOption {
  value: string;
  label: string;
}

export interface SegmentedControlProps {
  options: SegmentOption[];
  value: string;
  onChange: (value: string) => void;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      next = (index + 1) % options.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      next = (index - 1 + options.length) % options.length;
    } else {
      return;
    }

    buttonRefs.current[next]?.focus();
    onChange(options[next].value);
  }

  return (
    <div
      role="group"
      aria-label="Options"
      className="inline-flex rounded-lg border border-[var(--accent)] overflow-hidden"
    >
      {options.map((option, i) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => { buttonRefs.current[i] = el; }}
            type="button"
            role="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            tabIndex={selected ? 0 : -1}
            className={`min-h-[44px] px-5 py-2 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent)] ${
              i > 0 ? 'border-l border-[var(--accent)]' : ''
            } ${
              selected
                ? 'bg-[var(--accent)] text-white'
                : 'bg-transparent text-[var(--accent)] hover:bg-sky-50'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
