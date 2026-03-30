'use client';

import { useState, type ReactNode } from 'react';

interface Props {
  value: string;
  display: ReactNode;
  label?: string;
}

export default function CopyableValue({ value, display, label }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy();
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      onKeyDown={handleKeyDown}
      aria-label={label ?? `Copy ${value}`}
      className="group relative inline-flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
    >
      {/* Tooltip — appears on hover (desktop) */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      >
        {copied ? 'Copied!' : 'Click to copy'}
      </span>

      {display}

      {/* Clipboard icon — always visible on mobile, faint on desktop until hover */}
      <svg
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 16 16"
        fill="currentColor"
        className="h-3.5 w-3.5 shrink-0 opacity-50 sm:opacity-30 sm:group-hover:opacity-80 transition-opacity"
      >
        <path
          fillRule="evenodd"
          d="M5.5 2A1.5 1.5 0 0 0 4 3.5v9A1.5 1.5 0 0 0 5.5 14h5a1.5 1.5 0 0 0 1.5-1.5V6.621a1.5 1.5 0 0 0-.44-1.06L9.94 3.439A1.5 1.5 0 0 0 8.878 3H5.5ZM3 3.5A2.5 2.5 0 0 1 5.5 1h3.378a2.5 2.5 0 0 1 1.768.732l1.621 1.622A2.5 2.5 0 0 1 13 5.12V12.5A2.5 2.5 0 0 1 10.5 15h-5A2.5 2.5 0 0 1 3 12.5v-9Z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}
